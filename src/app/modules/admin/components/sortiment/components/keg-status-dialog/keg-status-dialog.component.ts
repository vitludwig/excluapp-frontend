import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortimentService } from '../../../../services/sortiment/sortiment.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnobModule } from 'primeng/knob';
import { IKegStatus } from '../../types/IKegStatus';
import { map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-keg-status-dialog',
	standalone: true,
	imports: [CommonModule, KnobModule, FormsModule],
	templateUrl: './keg-status-dialog.component.html',
	styleUrls: ['./keg-status-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KegStatusDialogComponent implements OnInit {
	private readonly sortimentService = inject(SortimentService);
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig<{ kegId: number }>);

	protected status$: Observable<IKegStatus> | null = null;

	public ngOnInit() {
		this.status$ = this.sortimentService.getKegStatus(this.dialogConfig.data.kegId).pipe(
			map((status) => {
				status.consumedVolume = +status.consumedVolume;
				return status;
			}),
		);
	}
}
