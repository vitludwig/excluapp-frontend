import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { firstValueFrom, map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout/layout.service';
import { KegUsersStatisticsDialogComponent } from '../../../admin/components/sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { IKegStatus } from '../../../admin/components/sortiment/types/IKegStatus';
import { EventService } from '../../../admin/services/event/event.service';
import { SortimentService } from '../../../admin/services/sortiment/sortiment.service';
import { IKeg } from '../../../admin/types/IKeg';
import { UserFaceRecognitionComponent } from '../../../user/components/user-face-recognition/user-face-recognition.component';
import { FaceRecognitionService } from '../../../user/services/face-recognition/face-recognition.service';
import { UserService } from '../../../user/services/user/user.service';
import { IUserRead } from '../../../user/types/IUser';
import { AsSortimentCategoryPipe } from '../../pipes/as-sortiment-category.pipe';
import { OrderService } from '../../services/order/order.service';
import { EBeerVolume } from '../../types/EBeerVolume';
import { IBeerpong } from '../../types/IBeerpong';
import { BeerpongDialogComponent } from './components/beerpong-dialog/beerpong-dialog.component';
import { DashboardSortimentSelectComponent } from './components/dashboard-sortiment-select/dashboard-sortiment-select.component';
import { DashboardUserSelectComponent } from './components/dashboard-user-select/dashboard-user-select.component';

@Component({
	selector: 'app-sale-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		CardModule,
		ButtonModule,
		DividerModule,
		AsSortimentCategoryPipe,
		DashboardUserSelectComponent,
		DashboardSortimentSelectComponent,
		AccordionModule,
		KnobModule,
		FormsModule,
		UserFaceRecognitionComponent,
	],
	providers: [DialogService],
	templateUrl: './sale-dashboard.component.html',
	styleUrls: ['./sale-dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleDashboardComponent implements OnDestroy {
	protected readonly eventService = inject(EventService);
	protected readonly sortimentService = inject(SortimentService);
	protected readonly orderService = inject(OrderService);
	protected readonly userService: UserService = inject(UserService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);

	private readonly dialogService: DialogService = inject(DialogService);
	private readonly layoutService = inject(LayoutService);
	private readonly messageService = inject(MessageService);

	protected beerpongDialogRef: DynamicDialogRef | null = null;
	private kegUserStatisticsDialogRef: DynamicDialogRef | null = null;

	protected $kegs = computed(() => {
		return this.sortimentService
			.$allSortiment()
			.filter((s) => this.eventService.$activeEvent()?.kegs.includes(s.id) && !s.isEmpty && s.isActive)
			.sort((a, b) => a.position - b.position);
	});

	protected $kegStats = computed(() => {
		const stats: { keg: IKeg; status: Observable<IKegStatus> }[] = [];
		const kegs = this.$kegs().sort((a, b) => a.position - b.position);
		for (const keg of kegs) {
			stats.push({
				keg,
				status: this.sortimentService.getKegStatus(keg.id).pipe(
					map((status) => {
						status.consumedVolume *= 2;
						status.totalVolume *= 2;

						return status;
					}),
				),
			});
		}

		return stats;
	});

	protected $selectedUser = signal<IUserRead | null>(null);
	protected $usersInEvent = computed(() => {
		const event = this.eventService.$activeEvent();
		if (event) {
			return this.eventService.getUsersForEvent(event.id).pipe(
				tap((users: IUserRead[]) => {
					const usersInEventIds = users.map((u) => u.id);
					this.$usersOther.set(this.userService.$users().filter((u) => !usersInEventIds.includes(u.id)));
				}),
			);
		}
		return of([]);
	});

	protected $usersOther = signal<IUserRead[]>([]);
	protected beerpongOpened = false;

	private unsubscribe$: Subject<void> = new Subject<void>();

	protected clearOrder() {
		this.orderService.clearOrder();
		this.$selectedUser.set(null);
		this.layoutService.$topBarTitle.set('');
	}

	protected confirmOrder() {
		this.orderService
			.confirmOrder()
			.pipe(
				tap(() => {
					this.clearOrder();
					new Audio('/assets/finish.mp3').play();
					this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Zapsáno!' });
				}),
			)
			.subscribe();
	}

	protected async showBeerpongDialog(): Promise<void> {
		const users = await firstValueFrom(this.$usersInEvent());
		this.beerpongDialogRef = this.dialogService.open(BeerpongDialogComponent, {
			header: 'Býrponk!',
			width: '90%',
			contentStyle: { overflow: 'auto', paddingBottom: 0 },
			dismissableMask: true,
			data: {
				kegs: this.$kegs(),
				users: users,
			},
		});

		this.beerpongOpened = true;

		this.beerpongDialogRef.onClose.pipe(takeUntil(this.unsubscribe$)).subscribe((data: IBeerpong[]) => {
			this.beerpongOpened = false;
			if (data) {
				for (const obj of data) {
					this.orderService.addOneToCart(obj.kegId, obj.userId, EBeerVolume.BIG, true);
				}
				this.confirmOrder();
			}
		});
	}

	protected selectUser(value: IUserRead | null): void {
		this.$selectedUser.set(value);
		this.layoutService.$topBarTitle.set(value?.name ?? '');
	}

	protected async showKegStatistics(keg: IKeg): Promise<void> {
		const result = await firstValueFrom(this.sortimentService.getKegUsersStatistics(keg.id));

		this.kegUserStatisticsDialogRef = this.dialogService.open(KegUsersStatisticsDialogComponent, {
			header: `Stav ${keg.name}`,
			width: '90%',
			data: {
				statistics: result,
			},
			dismissableMask: true,
		});
	}

	public ngOnDestroy() {
		this.beerpongDialogRef?.close();
		this.kegUserStatisticsDialogRef?.close();
		this.unsubscribe$.next();
	}
}
