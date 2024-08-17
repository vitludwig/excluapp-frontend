import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KegStatusPipe } from '@modules/sale/pipes/keg-status.pipe';
import { KegUsersStatisticsDialogComponent } from '@modules/sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-dashboard-sortiment-statistics',
	standalone: true,
	imports: [AsyncPipe, KegStatusPipe, KnobModule, FormsModule],
	templateUrl: './dashboard-sortiment-statistics.component.html',
	styleUrl: './dashboard-sortiment-statistics.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSortimentStatisticsComponent implements OnDestroy {
	private readonly sortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);

	public $kegs = input.required<IKeg[]>({ alias: 'kegs' });

	private kegUserStatisticsDialogRef: DynamicDialogRef | null = null;

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
		this.kegUserStatisticsDialogRef?.close();
	}
}
