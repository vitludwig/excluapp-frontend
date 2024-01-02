import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../admin/services/event/event.service';
import { SortimentService } from '../../../admin/services/sortiment/sortiment.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from '../../../user/services/user/user.service';
import { IUserRead } from '../../../user/types/IUser';
import { LayoutService } from '../../../../layout/services/layout/layout.service';
import { OrderService } from '../../services/order/order.service';
import { firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { BeerpongDialogComponent } from './components/beerpong-dialog/beerpong-dialog.component';
import { IBeerpong } from '../../types/IBeerpong';
import { EBeerVolume } from '../../types/EBeerVolume';
import { DividerModule } from 'primeng/divider';
import { AsSortimentCategoryPipe } from '../../pipes/as-sortiment-category.pipe';
import { DashboardUserSelectComponent } from './components/dashboard-user-select/dashboard-user-select.component';
import { DashboardSortimentSelectComponent } from './components/dashboard-sortiment-select/dashboard-sortiment-select.component';
import { AccordionModule } from 'primeng/accordion';
import { KnobModule } from 'primeng/knob';
import { IKegStatus } from '../../../admin/components/sortiment/types/IKegStatus';
import { FormsModule } from '@angular/forms';
import { IKeg } from '../../../admin/types/IKeg';
import { UserFaceRecognitionComponent } from '../../../user/components/user-face-recognition/user-face-recognition.component';
import { FaceRecognitionService } from '../../../user/services/face-recognition/face-recognition.service';

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

	private beerpongDialogRef: DynamicDialogRef | null = null;

	protected $sortiment = computed(() => {
		return this.sortimentService.$allSortiment().filter((s) => this.eventService.$activeEvent()?.kegs.includes(s.id) && !s.isEmpty && s.isActive);
	});

	protected $kegStats = computed(() => {
		const stats: Record<number, { keg: IKeg; status: Observable<IKegStatus> }> = {};
		for (const keg of this.$sortiment()) {
			stats[keg.id] = {
				keg,
				status: this.sortimentService.getKegStatus(keg.id).pipe(
					map((status) => {
						status.consumedVolume *= 2;
						status.totalVolume *= 2;

						return status;
					}),
				),
			};
		}

		return stats;
	});

	protected $selectedUser = signal<IUserRead | null>(null);
	protected $usersInEvent = computed(() => {
		const event = this.eventService.$activeEvent();
		if (event) {
			return this.eventService.getUsersForEvent(event.id).pipe(
				tap((users) => {
					const usersInEventIds = users.map((u) => u.id);
					this.$usersOther.set(this.userService.$users().filter((u) => !usersInEventIds.includes(u.id)));
				}),
			);
		}
		return of([]);
	});

	protected $usersOther = signal<IUserRead[]>([]);

	constructor() {}

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
			data: {
				kegs: this.$sortiment(),
				users: users,
			},
		});

		this.beerpongDialogRef.onClose.subscribe((data: IBeerpong[]) => {
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

	public ngOnDestroy() {
		this.beerpongDialogRef?.close();
	}
}
