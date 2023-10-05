import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'app-invite-dialog',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule],
	templateUrl: './invite-dialog.component.html',
	styleUrls: ['./invite-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteDialogComponent implements OnInit {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig);
	public readonly messageService = inject(MessageService);

	protected address: string = '';

	public ngOnInit() {
		this.address = this.dialogConfig.data.address;
	}

	protected async copyAddress(): Promise<void> {
		await navigator.clipboard.writeText(this.address);
		this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Adresa zkopírována do schránky' });
		this.dialogRef.close();
	}
}
