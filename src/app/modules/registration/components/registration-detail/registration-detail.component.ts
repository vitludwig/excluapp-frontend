import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { AuthService } from '@common/services/auth.service';
import { NotificationService } from '@common/services/notification.service';
import { AttendDialogComponent } from '@modules/registration/components/attend-dialog/attend-dialog.component';
import { RegistrationStore } from '@modules/registration/registration.store';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-registration-detail',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, SharedModule, TableModule, TooltipModule, ConfirmComponent, DialogModule, AttendDialogComponent],
	templateUrl: './registration-detail.component.html',
	styleUrls: ['./registration-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationDetailComponent {
	protected readonly registrationStore = inject(RegistrationStore);
	protected readonly authService = inject(AuthService);
	private readonly notificationService = inject(NotificationService);

	protected $enableRegistration = computed(() => {
		if (this.authService.$isLogged()) {
			return true;
		}
		const event = this.registrationStore.event();
		if (!event) {
			return false;
		}
		return this.registrationStore.eventUsers().length < event.capacity;
	});

	protected $showSelectUserModal = signal<boolean>(false);

	constructor() {
		this.registrationStore.loadUsers().subscribe({
			error: () => this.notificationService.error('Nepodařilo se načíst uživatele k události'),
		});
	}

	protected showAttendModal(): void {
		this.$showSelectUserModal.set(true);
	}

	protected removeUser(id: number) {
		this.registrationStore.removeUser(id).subscribe({
			next: () => this.notificationService.success('Uživatel byl odstraněn z události'),
			error: () => this.notificationService.error('Nepodařilo se odstranit uživatele z události'),
		});
	}
}
