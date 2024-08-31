import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@common/services/notification.service';
import { EventStore } from '@modules/event/event.store';
import { DashboardSortimentStatisticsComponent } from '@modules/sale/components/sale-dashboard/components/dashboard-sortiment-statistics/dashboard-sortiment-statistics.component';
import { OrderControlsComponent } from '@modules/sale/components/sale-dashboard/components/order-controls/order-controls.component';
import { OrderStore } from '@modules/sale/order.store';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { UserStore } from '@modules/user/user.store';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { forkJoin, Subject, takeUntil, tap } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout/layout.service';
import { UserFaceRecognitionComponent } from '../../../user/components/user-face-recognition/user-face-recognition.component';
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
		DashboardSortimentStatisticsComponent,
		OrderControlsComponent,
	],
	providers: [DialogService, OrderStore],
	templateUrl: './sale-dashboard.component.html',
	styleUrls: ['./sale-dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleDashboardComponent implements OnDestroy {
	protected readonly userStore = inject(UserStore);
	protected readonly sortimentStore = inject(SortimentStore);
	protected readonly eventStore = inject(EventStore);
	protected readonly orderStore = inject(OrderStore);

	protected readonly orderService = inject(OrderService);

	private readonly dialogService: DialogService = inject(DialogService);
	private readonly layoutService = inject(LayoutService);
	private readonly notificationService = inject(NotificationService);

	protected beerpongDialogRef: DynamicDialogRef | null = null;

	protected $otherUsers = signal<IUser[]>([]);

	private unsubscribe$: Subject<void> = new Subject<void>();

	protected resetOrder() {
		this.orderStore.resetOrder();
		this.layoutService.$topBarTitle.set('');
	}

	// TODO: move to store
	protected confirmOrder() {
		this.orderStore.setOrderProcessing(true);

		const activeEvent = this.eventStore.activeEvent();
		if (!activeEvent) {
			console.error('No active event set for order');
			return;
		}

		const requests = [];
		for (const item of this.orderStore.cart()) {
			const req = this.orderService.addOrder({
				userId: item.userId,
				kegId: item.kegId,
				volume: item.volume,
				eventId: activeEvent.id,
			});
			requests.push(req);
		}

		forkJoin(requests)
			.pipe(
				tap(() => {
					this.orderStore.setOrderProcessing(false);
					new Audio('/assets/finish.mp3').play();
					this.resetOrder();
				}),
			)
			.subscribe({
				next: () => this.notificationService.success('Zapsáno!'),
				error: () => this.notificationService.success('Nepodařilo zapsat objednávku'),
			});
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

		this.beerpongDialogRef.onClose.pipe(takeUntil(this.unsubscribe$)).subscribe((data: IBeerpong[]) => {
			if (data) {
				for (const obj of data) {
					this.orderStore.addOneToCart({ kegId: obj.kegId, userId: obj.userId, volume: EBeerVolume.BIG, isBeerpong: true });
				}
				this.confirmOrder();
			}
		});
	}

	protected selectUser(value: IUser): void {
		this.orderStore.setSelectedUser(value);
		this.layoutService.$topBarTitle.set(value?.name ?? '');
	}

	/**
	 * Load this data on user open event, otherwise accordeon component will have default height by it's data due to bug
	 * @param opened
	 * @param usersInEvent
	 * @protected
	 */
	protected loadOtherUsers(opened: boolean, usersInEvent: IUser[]) {
		if (opened) {
			const usersInEventIds = usersInEvent.map((user) => user.id);
			const otherUsers = this.userStore.users().filter((user) => !usersInEventIds.includes(user.id));
			this.$otherUsers.set(otherUsers);
		} else {
			this.$otherUsers.set([]);
		}
	}

	public stornoOrder(orderId: number) {
		this.orderService.removeOrder(orderId).subscribe({
			next: () => this.notificationService.success('Stornováno'),
			error: (e) => this.notificationService.error('Stornování selhalo'),
		});
	}

	public ngOnDestroy() {
		this.beerpongDialogRef?.close();
		this.unsubscribe$.next();
	}
}
