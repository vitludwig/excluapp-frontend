import { CommonModule, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, output } from '@angular/core';
import { ICartItem } from '@modules/sale/types/ICartItem';
import { TCartCountMap } from '@modules/sale/types/TCartCountMap';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { IUser } from '@modules/user/types/IUser';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { AsSortimentCategoryPipe } from '../../../../pipes/as-sortiment-category.pipe';
import { EBeerVolume } from '../../../../types/EBeerVolume';

@Component({
	selector: 'app-dashboard-sortiment-select',
	standalone: true,
	imports: [CommonModule, ButtonModule, DividerModule, AsSortimentCategoryPipe, CardModule, ConfirmDialogModule, DecimalPipe],
	templateUrl: './dashboard-sortiment-select.component.html',
	styleUrls: ['./dashboard-sortiment-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService, ConfirmationService],
})
export class DashboardSortimentSelectComponent implements OnDestroy {
	private readonly confirmationService = inject(ConfirmationService);

	public $selectedUser = input.required<IUser>({ alias: 'selectedUser' });
	public $sortiment = input.required<IKeg[]>({ alias: 'sortiment' });
	public $cartCountMap = input.required<TCartCountMap>({ alias: 'cartCountMap' });

	public itemAdd = output<ICartItem>();
	public itemRemove = output<{ id: number; volume: number }>();

	protected readonly EBeerVolume = EBeerVolume;
	private unsubscribe$: Subject<void> = new Subject<void>();

	public addToCart(kegId: number, userId: number, volume: EBeerVolume = EBeerVolume.BIG, isBeerpong: boolean = false, $event?: MouseEvent) {
		if (volume === EBeerVolume.SMALL) {
			this.confirmationService.confirm({
				message: 'Fakt seš taková křupka a piješ malý pivo?',
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				acceptButtonStyleClass: 'p-button-success',
				rejectButtonStyleClass: 'p-button-danger',
				accept: () => {
					this.addOneToCart(kegId, userId, volume, isBeerpong, $event);
				},
			});
		} else {
			this.addOneToCart(kegId, userId, volume, isBeerpong, $event);
		}
	}

	protected addOneToCart(kegId: number, userId: number, volume: EBeerVolume = EBeerVolume.BIG, isBeerpong: boolean = false, $event?: MouseEvent) {
		if ($event) {
			$event.stopPropagation();
		}
		this.itemAdd.emit({ userId, kegId, isBeerpong, volume });
	}

	protected removeOneFromCart(value: IKeg, $event: MouseEvent, volume: EBeerVolume) {
		if ($event) {
			$event.stopPropagation();
		}
		this.itemRemove.emit({ id: value.id, volume });
	}

	public ngOnDestroy() {
		this.unsubscribe$.next();
	}
}
