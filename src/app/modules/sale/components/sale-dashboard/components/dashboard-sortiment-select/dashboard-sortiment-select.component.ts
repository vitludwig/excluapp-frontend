import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, OnDestroy, Output, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { EventService } from '../../../../../admin/services/event/event.service';
import { SortimentService } from '../../../../../admin/services/sortiment/sortiment.service';
import { IKeg } from '../../../../../admin/types/IKeg';
import { IUserRead } from '../../../../../user/types/IUser';
import { AsSortimentCategoryPipe } from '../../../../pipes/as-sortiment-category.pipe';
import { OrderService } from '../../../../services/order/order.service';
import { EBeerVolume } from '../../../../types/EBeerVolume';
import { IOrderRead, IOrderReadGroup } from '../../../../types/IOrder';
import { SummaryItemDialogComponent } from '../../../summary-item-dialog/summary-item-dialog.component';

@Component({
	selector: 'app-dashboard-sortiment-select',
	standalone: true,
	imports: [CommonModule, ButtonModule, DividerModule, AsSortimentCategoryPipe, CardModule, ConfirmDialogModule],
	templateUrl: './dashboard-sortiment-select.component.html',
	styleUrls: ['./dashboard-sortiment-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService, ConfirmationService],
})
export class DashboardSortimentSelectComponent implements OnDestroy {
	protected readonly sortimentService = inject(SortimentService);
	protected readonly eventService = inject(EventService);
	protected readonly orderService = inject(OrderService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly messageService = inject(MessageService);
	private readonly confirmationService = inject(ConfirmationService);

	protected readonly EBeerVolume = EBeerVolume;

	public $selectedUser = input.required<IUserRead>({ alias: 'selectedUser' });
	public $sortiment = input.required<IKeg[]>({ alias: 'sortiment' });

	@Output()
	public confirm: EventEmitter<void> = new EventEmitter<void>();

	@Output()
	public cancel: EventEmitter<void> = new EventEmitter<void>();

	protected $summary = computed(() => {
		if (!this.$selectedUser || !this.eventService.$activeEvent()) {
			return;
		}

		return this.orderService.getOrderByEventUserId(this.eventService.$activeEvent()?.id!, this.$selectedUser().id).pipe(
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
	private unsubscribe$: Subject<void> = new Subject<void>();

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

		this.summaryDialogRef.onClose.pipe(takeUntil(this.unsubscribe$)).subscribe((data: IOrderReadGroup) => {
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

	public addToCart(kegId: number, userId: number, volume: EBeerVolume = EBeerVolume.BIG, isBeerpong: boolean = false, $event?: MouseEvent) {
		if (volume === EBeerVolume.SMALL) {
			this.confirmationService.confirm({
				message: 'Fakt seš taková křupka a piješ malý pivo?',
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				acceptButtonStyleClass: 'p-button-success',
				rejectButtonStyleClass: 'p-button-danger',
				accept: () => {
					this.orderService.addOneToCart(kegId, userId, volume, isBeerpong, $event);
				},
			});
		} else {
			this.orderService.addOneToCart(kegId, userId, volume, isBeerpong, $event);
		}
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
		this.unsubscribe$.next();
	}
}
