import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import {
	EventSortimentComponent
} from '@modules/event/components/event-detail/components/event-sortiment/event-sortiment.component';
import { Button } from 'primeng/button';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ChangeKegDialogData {
	eventId: string;
}

@Component({
	selector: 'app-change-keg-dialog',
	standalone: true,
	imports: [EventSortimentComponent, Button, AsyncPipe, RouterLink],
	templateUrl: './change-keg-dialog.component.html',
	styleUrl: './change-keg-dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeKegDialogComponent {
	private readonly sortimentService = inject(SortimentService);
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig<ChangeKegDialogData>);

	protected newKeg: IKeg | null = null;
	protected originalKegs$ = this.sortimentService.getSortimentList(undefined, { isOriginal: true });
	protected eventId: string;

	constructor() {
		this.eventId = this.dialogConfig.data.eventId;
	}

	protected confirm() {
		if (!this.newKeg) {
			return;
		}
		this.newKeg.isEmpty = false;
		this.newKeg.isOriginal = false;
		// @ts-ignore
		delete this.newKeg.id;
		this.dialogRef.close(this.newKeg);
	}
}
