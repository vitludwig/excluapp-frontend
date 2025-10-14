import { ChangeDetectionStrategy, Component, inject, model, signal, viewChild } from '@angular/core';
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { SelectUserComponent } from '@modules/user/components/select-user/select-user.component';
import { RegistrationStore } from '@modules/registration/registration.store';
import { IUser } from '@modules/user/types/IUser';
import { takeUntil, tap } from 'rxjs';
import { NotificationService } from '@common/services/notification.service';
import { WithSubscriptionsComponent } from '@common/components/with-subscriptions.component';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-attend-dialog',
	standalone: true,
	imports: [Button, DialogModule, SelectUserComponent, RouterLink],
	templateUrl: './attend-dialog.component.html',
	styleUrl: './attend-dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendDialogComponent extends WithSubscriptionsComponent {
	protected readonly registrationStore = inject(RegistrationStore);
	private readonly notificationService = inject(NotificationService);

	public $visible = model<boolean>(false, { alias: 'visible' });

	protected selectUserPicker = viewChild<SelectUserComponent>('selectUserPicker');
	protected $selectedUser = signal<IUser | null>(null);

	protected selectUser(user: IUser | null): void {
		const event = this.registrationStore.event();
		if (!user || !event) {
			console.error('Invalid user or event selected');
			return;
		}

		this.registrationStore
			.addUser(user.id)
			.pipe(
				takeUntil(this.destroy$),
				tap(() => {
					this.$visible.set(false);
					this.selectUserPicker()?.reset();
				}),
			)
			.subscribe({
				next: () => this.notificationService.success('Uživatel byl přidán k události'),
				error: () => this.notificationService.error('Nepodařilo se přidat uživatele k události'),
			});
	}

	protected hideDialog(): void {
		this.$visible.set(false);
	}
}
