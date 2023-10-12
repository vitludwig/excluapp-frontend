import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EBeerVolume } from '../../../../types/EBeerVolume';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AsSortimentCategoryPipe } from '../../../../pipes/as-sortiment-category.pipe';
import { CardModule } from 'primeng/card';
import { map, tap } from 'rxjs';
import { SortimentService } from '../../../../../admin/services/sortiment/sortiment.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IUserRead } from '../../../../../user/types/IUser';
import { EventService } from '../../../../../admin/services/event/event.service';
import { OrderService } from '../../../../services/order/order.service';
import { IOrderRead, IOrderReadGroup } from '../../../../types/IOrder';
import { IKeg } from '../../../../../admin/types/IKeg';
import { SummaryItemDialogComponent } from '../../../summary-item-dialog/summary-item-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'app-dashboard-sortiment-select',
	standalone: true,
	imports: [CommonModule, ButtonModule, DividerModule, AsSortimentCategoryPipe, CardModule],
	templateUrl: './dashboard-sortiment-select.component.html',
	styleUrls: ['./dashboard-sortiment-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService],
})
export class DashboardSortimentSelectComponent implements OnDestroy {
	protected readonly sortimentService = inject(SortimentService);
	protected readonly eventService = inject(EventService);
	protected readonly orderService = inject(OrderService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly messageService = inject(MessageService);

	protected readonly EBeerVolume = EBeerVolume;

	@Input({ required: true })
	public selectedUser!: IUserRead;

	@Input({ required: true })
	public sortiment!: IKeg[];

	@Output()
	public confirm: EventEmitter<void> = new EventEmitter<void>();

	@Output()
	public cancel: EventEmitter<void> = new EventEmitter<void>();

	protected $summary = computed(() => {
		if (!this.selectedUser || !this.eventService.$activeEvent()) {
			return;
		}

		return this.orderService.getOrderByEventUserId(this.eventService.$activeEvent()?.id!, this.selectedUser.id).pipe(
			map((obj) => {
				for (const item of obj) {
					item.kegName = this.sortimentService.$allSortiment().find((s) => s.id === item.kegId)?.name ?? '';
				}
				return this.groupOrderBySortiment(obj);
			}),
		);
	});
	protected $showSummary = signal<boolean>(false);

	private summaryDialogRef: DynamicDialogRef | null = null;

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
								this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Upraveno' });
							}),
						)
						.subscribe();
				}

				// TODO: update value properly, this is veeery ugly
				setTimeout(() => {
					// TODO: update user value
					// this.$selectedUser.set(this.$selectedUser());
				}, 1000);
			}
		});
	}

	protected confirmOrder(): void {
		this.confirm.emit();
	}

	protected cancelOrder(): void {
		this.cancel.emit();
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

	protected toggleSummary() {
		this.$showSummary.set(!this.$showSummary());
	}

	public ngOnDestroy() {
		this.summaryDialogRef?.close();
	}
}
