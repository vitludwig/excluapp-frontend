import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../admin/services/event/event.service';
import { Observable, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { IEvent } from '../../../admin/types/IEvent';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectUserDialogComponent } from '../../../user/components/select-user-dialog/select-user-dialog.component';
import { IUserRead } from '../../../user/types/IUser';
import { UserService } from '../../../user/services/user/user.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../common/components/confirm/confirm.component';

@Component({
	selector: 'app-registration-detail',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, SharedModule, TableModule, TooltipModule, ConfirmComponent],
	providers: [DialogService],
	templateUrl: './registration-detail.component.html',
	styleUrls: ['./registration-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationDetailComponent implements OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly eventService: EventService = inject(EventService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly usersService: UserService = inject(UserService);
	private readonly messageService = inject(MessageService);

	protected eventId: number;
	protected event: Observable<IEvent>;
	protected $eventUsers = signal<IUserRead[]>([]);

	private attendDialogRef: DynamicDialogRef;

	constructor() {
		// TOOD: vyresit NaN
		this.eventId = Number(this.activatedRoute.snapshot.paramMap.get('eventId')); // eventId has always value, otherwise it's redirected to list

		if (this.eventId) {
			this.loadUsers();
			this.event = this.eventService.getEvent(this.eventId);
		}
	}

	protected showAttendModal(): void {
		this.attendDialogRef = this.dialogService.open(SelectUserDialogComponent, {
			header: 'Přidat pijáka',
			width: '50%',
			contentStyle: { overflow: 'auto' },
			data: {
				users: this.usersService.$users().filter((user) => !this.$eventUsers().find((u) => u.id === user.id)),
			},
		});

		this.attendDialogRef.onClose.subscribe((data: { newUser: string | null; existingUser: IUserRead | null }) => {
			if (data.newUser) {
				this.usersService.addUser({ name: data.newUser }).subscribe((user) => {
					this.attendEvent(user.id, this.eventId);
				});
			}
			if (data.existingUser) {
				this.attendEvent(data.existingUser.id, this.eventId);
			}
		});
	}

	public ngOnDestroy() {
		if (this.attendDialogRef) {
			this.attendDialogRef.close();
		}
	}

	protected unattend(userId: number): void {
		this.eventService
			.unAttendEvent(userId, this.eventId)
			.pipe(tap(() => this.loadUsers()))
			.subscribe();
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

	private loadUsers(): void {
		this.eventService
			.getUsersForEvent(this.eventId)
			.pipe(
				tap((users) => {
					this.$eventUsers.set(users);
				}),
			)
			.subscribe();
	}
}
