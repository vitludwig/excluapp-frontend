import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { BackBtnDirective } from '@common/directives/back-btn/back-btn.directive';
import { AuthService } from '@common/services/auth.service';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom, tap } from 'rxjs';
import { SelectUserDialogComponent } from '../../../user/components/select-user-dialog/select-user-dialog.component';
import { SelectUserComponent } from '../../../user/components/select-user/select-user.component';
import { UserService } from '../../../user/services/user/user.service';
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationDetailComponent implements OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly eventService: EventService = inject(EventService);
	private readonly usersService: UserService = inject(UserService);
	private readonly messageService = inject(MessageService);
	private readonly sortimentService = inject(SortimentService);
	protected readonly authService: AuthService = inject(AuthService);

	protected eventId: number;
	protected $event: Signal<IEvent | undefined> = signal(undefined);
	protected $eventUsers = signal<IUser[]>([]);
	protected $usersToPick = computed(() => this.usersService.$users().filter((user) => !this.$eventUsers().find((u) => u.id === user.id)));
	protected $enableRegistration = computed(() => {
		if (this.authService.$isLogged()) {
			return true;
		}

		const event = this.$event();
		if (!event) {
			return false;
		}

		return this.$eventUsers().length < event.capacity;
	});
	protected $eventKegs: Signal<IKeg[]> = computed(() => {
		const event = this.$event();
		if (!event) {
			return [];
		}

		return this.sortimentService.$copySortiment().filter((keg) => event.kegs.includes(keg.id) && !keg.isEmpty);
	});

	protected showSelectUserModal = false;
	protected selectedUser: IUser | null = null;

	private attendDialogRef: DynamicDialogRef;

	constructor() {
		// TOOD: vyresit NaN
		this.eventId = Number(this.activatedRoute.snapshot.paramMap.get('eventId')); // eventId has always value, otherwise it's redirected to list

		if (this.eventId) {
			this.loadUsers();
			this.$event = toSignal(this.eventService.getEvent(this.eventId));
		}
	}

	protected showAttendModal(): void {
		this.showSelectUserModal = true;
	}

	protected selectUser(data: IUser | null): void {
		if (data) {
			this.attendEvent(data.id, this.eventId);
		}

		this.showSelectUserModal = false;
	}

	public ngOnDestroy() {
		if (this.attendDialogRef) {
			this.attendDialogRef.close();
		}
	}

	protected async unattend(userId: number): Promise<void> {
		await firstValueFrom(this.eventService.unAttendEvent(userId, this.eventId));
		this.loadUsers();
	}

	private attendEvent(userId: number, eventId: number): void {
		this.eventService
			.attendEvent(userId, eventId)
			.pipe(tap(() => this.loadUsers()))
			.subscribe({
				next: () => this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Uživatel přidán' }),
				error: () => this.messageService.add({ severity: 'error', summary: 'Urgh', detail: 'Něco se posralo' }),
			});
	}

	private async loadUsers(): Promise<void> {
		const users = await firstValueFrom(this.eventService.getUsersForEvent(this.eventId));

		this.$eventUsers.set(users);
	}
}
