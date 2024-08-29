import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { NotificationService } from '@common/services/notification.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-invite-dialog',
	standalone: true,
	imports: [ButtonModule, InputTextModule],
	templateUrl: './invite-dialog.component.html',
	styleUrls: ['./invite-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteDialogComponent implements OnInit {
	public readonly dialogRef: DynamicDialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
	private readonly notificationService = inject(NotificationService);

	protected $address = signal<string>('');

	public ngOnInit() {
		this.$address.set(this.dialogConfig.data.address);
	}

	protected async copyAddress(): Promise<void> {
		await navigator.clipboard.writeText(this.$address());
		this.notificationService.success('Adresa zkopírována do schránky');
		this.dialogRef.close();
	}
}
