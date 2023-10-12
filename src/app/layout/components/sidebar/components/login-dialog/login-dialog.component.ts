import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
	selector: 'app-login-dialog',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule],
	templateUrl: './login-dialog.component.html',
	styleUrls: ['./login-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
	public readonly dialogRef = inject(DynamicDialogRef);

	protected numpad: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
	protected password: string = '';

	protected addNumber(number: string): void {
		this.password += number;
	}

	protected removeNumber(): void {
		this.password = this.password.slice(0, -1);
	}

	protected login(): void {
		this.dialogRef.close(this.password);
	}
}
