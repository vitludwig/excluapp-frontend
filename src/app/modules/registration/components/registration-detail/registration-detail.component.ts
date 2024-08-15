import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { BackBtnDirective } from '@common/directives/back-btn/back-btn.directive';
import { AuthService } from '@common/services/auth.service';
import { RegistrationStore } from '@modules/registration/registration.store';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
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
	protected registrationStore = inject(RegistrationStore);

	protected readonly authService = inject(AuthService);

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

	protected showSelectUserModal = false;
	protected selectedUser: IUser | null = null;

	private attendDialogRef: DynamicDialogRef;

	constructor() {
		this.registrationStore.loadUsers();
	}

	protected showAttendModal(): void {
		this.showSelectUserModal = true;
	}

	protected selectUser(user: IUser | null): void {
		const event = this.registrationStore.event();
		if (!user || !event) {
			console.error('Invalid user or event selected');
			return;
		}

		this.registrationStore.addUser(user.id);
		this.showSelectUserModal = false;
	}

	public ngOnDestroy() {
		if (this.attendDialogRef) {
			this.attendDialogRef.close();
		}
	}
}
