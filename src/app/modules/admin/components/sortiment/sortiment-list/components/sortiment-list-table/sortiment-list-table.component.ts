import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ConfirmComponent } from '../../../../../../../common/components/confirm/confirm.component';
import { IKeg } from '../../../../../types/IKeg';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { SortimentService } from '../../../../../services/sortiment/sortiment.service';
import { KegStatusDialogComponent } from '../../../components/keg-status-dialog/keg-status-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-sortiment-list-table',
	standalone: true,
	imports: [CommonModule, TableModule, TooltipModule, ButtonModule, ConfirmComponent, RouterLink, InputTextModule],
	templateUrl: './sortiment-list-table.component.html',
	styleUrls: ['./sortiment-list-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentListTableComponent implements OnDestroy {
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);

	@Input({ required: true })
	public kegs!: IKeg[];

	private kegStatusDialogRef: DynamicDialogRef | undefined;

	protected removeKeg(id: string) {
		this.sortimentService
			.removeSortiment(id)
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected setKegEmptyStatus(id: number, isEmpty: boolean) {
		this.sortimentService
			.updateSortiment(id, { isEmpty })
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected setKegDefectiveStatus(id: number, isDefective: boolean) {
		this.sortimentService
			.updateSortiment(id, { isDefective })
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected showKegStatusDialog(kegId: number) {
		this.kegStatusDialogRef = this.dialogService.open(KegStatusDialogComponent, {
			header: 'Vypito ze sudu',
			width: '400px',
			data: {
				kegId,
			},
		});
	}

	protected clearSearch(table: Table) {
		table.clear();
	}

	public ngOnDestroy() {
		this.kegStatusDialogRef?.close();
	}
}
