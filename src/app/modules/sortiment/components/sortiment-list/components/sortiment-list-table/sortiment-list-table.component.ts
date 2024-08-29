import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, output } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { TruncatePipe } from '@common/pipes/truncate.pipe';
import { EventByIdPipe } from '@modules/event/pipes/eventById.pipe';
import { KegStatusDialogComponent } from '@modules/sortiment/components/keg-status-dialog/keg-status-dialog.component';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-sortiment-list-table',
	standalone: true,
	imports: [TableModule, TooltipModule, ButtonModule, ConfirmComponent, RouterLink, InputTextModule, EventByIdPipe, TruncatePipe],
	templateUrl: './sortiment-list-table.component.html',
	styleUrls: ['./sortiment-list-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentListTableComponent implements OnDestroy {
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);

	public $kegs = input.required<IKeg[]>({ alias: 'kegs' });

	public kegDelete = output<number>();
	public kegUpdate = output<{ id: number; property: keyof IKeg; value: boolean }>();

	private kegStatusDialogRef: DynamicDialogRef | undefined;

	protected removeKeg(id: number) {
		this.kegDelete.emit(id);
	}

	protected setKegEmptyStatus(id: number, isEmpty: boolean) {
		this.kegUpdate.emit({ id, property: 'isEmpty', value: isEmpty });
	}

	protected setKegDefectiveStatus(id: number, isDefective: boolean) {
		this.kegUpdate.emit({ id, property: 'isDefective', value: isDefective });
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
