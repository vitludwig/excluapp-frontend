import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IEvent } from '@modules/event/types/IEvent';
import { KegStatusPipe } from '@modules/sale/pipes/keg-status.pipe';
import { ChangeKegDialogComponent } from '@modules/sortiment/components/change-keg-dialog/change-keg-dialog.component';
import { KegUsersStatisticsDialogComponent } from '@modules/sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { ButtonDirective } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { filter, first, firstValueFrom, finalize, switchMap } from 'rxjs';

@Component({
	selector: 'app-dashboard-sortiment-statistics',
	standalone: true,
	imports: [AsyncPipe, KegStatusPipe, KnobModule, FormsModule, ButtonDirective],
	templateUrl: './dashboard-sortiment-statistics.component.html',
	styleUrl: './dashboard-sortiment-statistics.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSortimentStatisticsComponent implements OnDestroy {
	private readonly sortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly sortimentStore = inject(SortimentStore);

	public $kegs = input.required<IKeg[]>({ alias: 'kegs' });
	public $event = input.required<IEvent | null>({ alias: 'event' });

	private kegUserStatisticsDialogRef: DynamicDialogRef | null = null;
	private changeKegDialogRef: DynamicDialogRef | null = null;

	protected async showKegStatistics(keg: IKeg): Promise<void> {
		if (this.kegUserStatisticsDialogRef) {
			return;
		}
		const result = await firstValueFrom(this.sortimentService.getKegUsersStatistics(keg.id));

		this.kegUserStatisticsDialogRef = this.dialogService.open(KegUsersStatisticsDialogComponent, {
			header: `Stav ${keg.name}`,
			width: '90%',
			data: {
				statistics: result,
			},
			dismissableMask: true,
		});

		this.kegUserStatisticsDialogRef.onClose.pipe(first()).subscribe(() => {
			this.kegUserStatisticsDialogRef = null;
		});
	}

	protected showChangeKegDialog(keg: IKeg): void {
		if (this.changeKegDialogRef) {
			return;
		}
		this.changeKegDialogRef = this.dialogService.open(ChangeKegDialogComponent, {
			header: `Přerazit ${keg.name}`,
			width: '90%',
			data: {
				eventId: this.$event()?.id,
			},
			dismissableMask: true,
		});

		this.changeKegDialogRef.onClose
			.pipe(
				filter((newKegTemplate): newKegTemplate is IKeg => !!newKegTemplate),
				switchMap((newKegTemplate) => {
					const event = this.$event();
					if (!event) {
						throw new Error('No active event found to add keg to');
					}
					return this.sortimentService.changeKeg(keg, newKegTemplate, event.id);
				}),
				finalize(() => {
					this.changeKegDialogRef = null;
				}),
			)
			.subscribe(() => {
				// Reload kegs for active event
				this.sortimentStore.loadKegsInActiveEvent();
			});
	}

	public ngOnDestroy() {
		this.kegUserStatisticsDialogRef?.close();
		this.changeKegDialogRef?.close();
	}
}
