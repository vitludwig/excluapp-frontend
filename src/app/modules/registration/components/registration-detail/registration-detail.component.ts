import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../admin/services/event/event.service';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { IEvent } from '../../../admin/types/IEvent';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectUserDialogComponent } from '../../../user/components/select-user-dialog/select-user-dialog.component';
import { IUserRead } from '../../../user/types/IUser';
import { UserService } from '../../../user/services/user/user.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../common/components/confirm/confirm.component';
import { DialogModule } from 'primeng/dialog';
import { SelectUserComponent } from '../../../user/components/select-user/select-user.component';
import { IUserSelectResponse } from '../../../user/types/IUserSelectResponse';
import { BackBtnDirective } from '../../../../common/directives/back-btn/back-btn.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../common/services/auth.service';
import { SortimentService } from '../../../admin/services/sortiment/sortiment.service';
import { IKeg } from '../../../admin/types/IKeg';

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
	protected $eventUsers = signal<IUserRead[]>([]);
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

		return this.sortimentService.$copySortiment().filter((keg) => event.kegs.includes(keg.id));
	});

	protected showSelectUserModal = false;

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

	protected selectUser(data: IUserSelectResponse): void {
		// TODO: refactor user select component to always return array or better type it, THIS IS UGLY
		// this is single user select, object and not array is passed
		if (data.existingUser && !Array.isArray(data.existingUser)) {
			this.attendEvent((<IUserRead>data.existingUser).id, this.eventId);
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
