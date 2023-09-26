import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../admin/services/event/event.service';
import { SortimentService } from '../../../admin/services/sortiment/sortiment.service';
import { CardModule } from 'primeng/card';
import { WebcamModule } from 'ngx-webcam';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectUserDialogComponent } from '../../../user/components/select-user-dialog/select-user-dialog.component';
import { UserService } from '../../../user/services/user/user.service';
import { IUserRead } from '../../../user/types/IUser';
import { LayoutService } from '../../../../layout/services/layout/layout.service';
import { OrderService } from '../../services/order/order.service';
import { map, tap } from 'rxjs';
import { IOrderRead, IOrderReadGroup } from '../../types/IOrder';
import { SelectUserComponent } from '../../../user/components/select-user/select-user.component';
import { IKeg } from '../../../admin/types/IKeg';
import { ICartItem } from '../../types/ICartItem';
import { MessageService } from 'primeng/api';
import { SummaryItemDialogComponent } from '../summary-item-dialog/summary-item-dialog.component';
import { BeerpongDialogComponent } from './components/beerpong-dialog/beerpong-dialog.component';
import { IBeerpong } from '../../types/IBeerpong';
import { EBeerVolume } from '../../types/EBeerVolume';

@Component({
	selector: 'app-sale-dashboard',
	standalone: true,
	imports: [CommonModule, CardModule, WebcamModule, ButtonModule, SelectUserDialogComponent, SelectUserComponent],
	providers: [DialogService],
	templateUrl: './sale-dashboard.component.html',
	styleUrls: ['./sale-dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleDashboardComponent implements OnDestroy {
	protected readonly eventService = inject(EventService);
	protected readonly sortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);
	protected readonly usersService: UserService = inject(UserService);
	private readonly layoutService = inject(LayoutService);
	private readonly orderService = inject(OrderService);
	private readonly messageService = inject(MessageService);

	protected readonly EBeerVolume = EBeerVolume;

	private summaryDialogRef: DynamicDialogRef | null = null;
	private beerpongDialogRef: DynamicDialogRef | null = null;

	protected $sortiment = computed(() => {
		return this.sortimentService.$allSortiment().filter((s) => this.eventService.$activeEvent()?.kegs.includes(s.id) && !s.isEmpty);
	});

	protected $summary = computed(() => {
		if (!this.$selectedUser() || !this.eventService.$activeEvent()) {
			return;
		}

		return this.orderService.getOrderByEventUserId(this.eventService.$activeEvent()?.id!, this.$selectedUser()!.id!).pipe(
			map((obj) => {
				return this.groupOrderBySortiment(obj);
			}),
		);
	});

	protected $selectedUser = signal<IUserRead | null>(null);
	protected $cart = signal<ICartItem[]>([]);

	// TODO: write this using reduce maybe?
	protected $cartCount = computed(() => {
		const result: Record<string, number> = {};

		for (const item of this.$cart()) {
			if (!result[item.kegId]) {
				result[item.kegId] = 1;
			} else {
				result[item.kegId]++;
			}
		}

		return result;
	});
	protected $showSummary = signal<boolean>(false);

	constructor() {}

	protected toggleSummary() {
		this.$showSummary.set(!this.$showSummary());
	}

	protected selectUser(value: IUserRead | null): void {
		this.$selectedUser.set(value);
		this.layoutService.$topBarTitle.set(value?.name ?? '');
	}

	protected addOneToCart(kegId: number, userId = this.$selectedUser()!.id, volume: EBeerVolume = EBeerVolume.BIG, isBeerpong: boolean = false, $event?: MouseEvent) {
		if ($event) {
			$event.stopPropagation();
		}
		this.$cart.update((cart) => [...cart, { userId, kegId, isBeerpong, volume }]);
	}

	protected removeOneToCart(value: IKeg, $event: MouseEvent) {
		if ($event) {
			$event.stopPropagation();
		}
		this.$cart.update((cart) => {
			const index = cart.findIndex((obj) => obj.kegId === value.id);
			if (index !== -1) {
				cart.splice(index, 1);
			}
			return cart;
		});
	}

	protected confirmOrder() {
		for (const item of this.$cart()) {
			this.orderService
				.addOrder({
					userId: item.userId,
					kegId: item.kegId,
					volume: item.volume,
					eventId: this.eventService.$activeEvent()?.id!,
				})
				.pipe(
					tap(() => {
						this.clearOrder();
						this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Zapsáno!' });
					}),
				)
				.subscribe();
		}
	}

	protected clearOrder() {
		this.$cart.set([]);
		this.$selectedUser.set(null);
		this.layoutService.$topBarTitle.set('');
	}

	protected showSummaryDetail(value: IOrderReadGroup) {
		this.summaryDialogRef = this.dialogService.open(SummaryItemDialogComponent, {
			header: 'Upravit ponožku',
			width: '80%',
			height: 'auto',
			contentStyle: { overflow: 'auto' },
			data: {
				item: value,
			},
		});

		this.summaryDialogRef.onClose.subscribe((data: IOrderReadGroup) => {
			if (data && data.orderIds.length > 0) {
				for (let i = 1; i <= Math.abs(value.count - data.count); i++) {
					this.orderService
						.removeOrder(data.orderIds.at(-i)!)
						.pipe(
							tap(() => {
								this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Upraveno' });
							}),
						)
						.subscribe();
				}

				// TODO: update value properly, this is veeery ugly
				setTimeout(() => {
					this.$selectedUser.set(this.$selectedUser());
				}, 1000);
			}
		});
	}

	protected showBeerpongDialog() {
		this.beerpongDialogRef = this.dialogService.open(BeerpongDialogComponent, {
			header: 'Býrponk!',
			width: '90%',
			contentStyle: { overflow: 'auto' },
			data: {
				kegs: this.$sortiment(),
				users: this.usersService.$users(),
			},
		});

		this.beerpongDialogRef.onClose.subscribe((data: IBeerpong[]) => {
			for (const obj of data) {
				this.addOneToCart(obj.kegId, obj.userId, EBeerVolume.BIG, true);
			}
		});
	}

	private groupOrderBySortiment(orders: IOrderRead[]): IOrderReadGroup[] {
		const items: Record<string, IOrderReadGroup> = {};

		for (const order of orders) {
			if (!items[order.kegId]) {
				items[order.kegId] = {
					...order,
					count: 1,
					orderIds: [order.id],
				};
			} else {
				items[order.kegId].count!++;
				items[order.kegId].orderIds!.push(order.id);
			}
		}

		return Object.values(items);
	}

	public ngOnDestroy() {
		this.summaryDialogRef?.close();
		this.beerpongDialogRef?.close();
	}
}
