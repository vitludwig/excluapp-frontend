import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
import { IEvent } from '@modules/event/types/IEvent';
import { OrderService } from '@modules/sale/services/order/order.service';
import { IOrderRead, IOrderReadGroup } from '@modules/sale/types/IOrder';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { IUser } from '@modules/user/types/IUser';
import { Button } from 'primeng/button';
import { map, of, Subject } from 'rxjs';

@Component({
	selector: 'app-order-controls',
	standalone: true,
	imports: [Button, AsyncPipe, JsonPipe],
	templateUrl: './order-controls.component.html',
	styleUrl: './order-controls.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderControlsComponent implements OnDestroy {
	private readonly orderService = inject(OrderService);

	public $confirmBtnDisabled = input.required<boolean>({ alias: 'confirmBtnDisabled' });
	public $cancelBtnDisabled = input.required<boolean>({ alias: 'cancelBtnDisabled' });
	public $selectedUser = input.required<IUser | null>({ alias: 'selectedUser' });
	public $activeEvent = input.required<IEvent | null>({ alias: 'activeEvent' });
	public $kegs = input.required<IKeg[]>({ alias: 'kegs' });

	public confirmOrder = output();
	public cancelOrder = output();
	public stornoOrder = output<number>();

	protected $showSummary = signal<boolean>(false);
	protected $summary = computed(() => {
		// do not make request if summary is not open
		if (!this.$showSummary()) {
			return of([]);
		}

		// do not make request if user is not selected
		const selectedUser = this.$selectedUser();
		if (!selectedUser) {
			return of([]);
		}

		const activeEvent = this.$activeEvent();
		if (!activeEvent) {
			return of([]);
		}

		return this.orderService.getOrderByEventUserId(activeEvent.id, selectedUser.id).pipe(
			map((obj) => {
				return this.groupOrderBySortiment(obj);
			}),
		);
	});

	private unsubscribe$: Subject<void> = new Subject<void>();

	protected confirm() {
		this.confirmOrder.emit();
	}

	protected cancel() {
		this.cancelOrder.emit();
	}

	protected removeOne(item: IOrderReadGroup) {
		const orderId = item.orderIds.at(-1);
		if (orderId) {
			this.stornoOrder.emit(orderId);
			this.$showSummary.set(false);
		}
	}

	protected toggleSummary() {
		this.$showSummary.set(!this.$showSummary());
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
		this.unsubscribe$.next();
	}
}
