import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-summary-item-dialog',
	standalone: true,
	imports: [InputNumberModule, FormsModule, ButtonModule],
	templateUrl: './summary-item-dialog.component.html',
	styleUrls: ['./summary-item-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryItemDialogComponent implements OnInit {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig);

	protected count: number = 1;

	public ngOnInit() {
		this.count = this.dialogConfig.data.item.count;
	}

	protected submit() {
		this.dialogRef.close({
			...this.dialogConfig.data.item,
			count: this.count,
		});
	}
}
