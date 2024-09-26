import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { BackBtnDirective } from '@common/directives/back-btn/back-btn.directive';
import { AuthService } from '@common/services/auth.service';
import { NotificationService } from '@common/services/notification.service';
import { RegistrationStore } from '@modules/registration/registration.store';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { tap } from 'rxjs';
import { SelectUserDialogComponent } from '../../../user/components/select-user-dialog/select-user-dialog.component';
import { SelectUserComponent } from '../../../user/components/select-user/select-user.component';
import { IUser } from '../../../user/types/IUser';

@Component({
	selector: 'app-registration-detail',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		InputTextModule,
		SharedModule,
		TableModule,
		TooltipModule,
		ConfirmComponent,
		DialogModule,
		SelectUserDialogComponent,
		SelectUserComponent,
		BackBtnDirective,
	],
	templateUrl: './registration-detail.component.html',
	styleUrls: ['./registration-detail.component.scss'],
	providers: [RegistrationStore],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationDetailComponent implements OnDestroy {
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
	protected $selectedUser = signal<IUser | null>(null);

	private attendDialogRef: DynamicDialogRef;

	constructor() {
		this.registrationStore.loadUsers().subscribe({
			error: () => this.notificationService.error('Nepodařilo se načíst uživatele k události'),
		});
	}

	protected showAttendModal(): void {
		this.$showSelectUserModal.set(true);
	}

	protected selectUser(user: IUser | null): void {
		const event = this.registrationStore.event();
		if (!user || !event) {
			console.error('Invalid user or event selected');
			return;
		}

		this.registrationStore
			.addUser(user.id)
			.pipe(
				tap(() => {
					this.$showSelectUserModal.set(false);
				}),
			)
			.subscribe({
				next: () => this.notificationService.success('Uživatel byl přidán k události'),
				error: () => this.notificationService.error('Nepodařilo se přidat uživatele k události'),
			});
	}

	protected removeUser(id: number) {
		this.registrationStore.removeUser(id).subscribe({
			next: () => this.notificationService.success('Uživatel byl odstraněn z události'),
			error: () => this.notificationService.error('Nepodařilo se odstranit uživatele z události'),
		});
	}

	public ngOnDestroy() {
		if (this.attendDialogRef) {
			this.attendDialogRef.close();
		}
	}
}
