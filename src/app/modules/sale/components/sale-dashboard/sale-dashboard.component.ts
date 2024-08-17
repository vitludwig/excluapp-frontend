import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DistinctFromPipe } from '@common/pipes/distinct-from.pipe';
import { EventService } from '@modules/event/services/event/event.service';
import { KegUsersStatisticsDialogComponent } from '@modules/sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { UserStore } from '@modules/user/user.store';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { catchError, firstValueFrom, of, Subject, takeUntil, tap } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout/layout.service';
import { UserFaceRecognitionComponent } from '../../../user/components/user-face-recognition/user-face-recognition.component';
import { FaceRecognitionService } from '../../../user/services/face-recognition/face-recognition.service';
import { UserService } from '../../../user/services/user/user.service';
import { IUser } from '../../../user/types/IUser';
import { AsSortimentCategoryPipe } from '../../pipes/as-sortiment-category.pipe';
import { KegStatusPipe } from '../../pipes/keg-status.pipe';
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
		KegStatusPipe,
		DistinctFromPipe,
	],
	providers: [DialogService],
	templateUrl: './sale-dashboard.component.html',
	styleUrls: ['./sale-dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleDashboardComponent implements OnDestroy {
	protected readonly userStore = inject(UserStore);
	protected readonly sortimentStore = inject(SortimentStore);

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

	protected $selectedUser = signal<IUser | null>(null);
	protected $usersOther = signal<IUser[] | null>(null);
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

	protected async showBeerpongDialog(kegs: IKeg[], users: IUser[]): Promise<void> {
		this.beerpongDialogRef = this.dialogService.open(BeerpongDialogComponent, {
			header: 'Býrponk!',
			width: '90%',
			contentStyle: { overflow: 'auto', paddingBottom: 0 },
			dismissableMask: true,
			data: {
				kegs: kegs,
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

	protected selectUser(value: IUser | null): void {
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

	/**
	 * Loads into signal users, that are not registered in event
	 * Used for 'Other' tab in user select accordion
	 *
	 * @param isOpened
	 * @protected
	 */
	protected loadOtherUsers(isOpened: boolean) {
		if (!isOpened) {
			return;
		}

		this.userStore
			.usersInEvent()
			.pipe(
				tap((users) => {
					const otherUsers = this.userStore.users().filter((u) => !users.map((u) => u.id).includes(u.id));
					this.$usersOther.set(otherUsers);
				}),
				catchError(() => of([])),
			)
			.subscribe();
	}
}
