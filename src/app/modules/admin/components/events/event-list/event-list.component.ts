import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { EventService } from '../../../services/event/event.service';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-event-list',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, RouterLink, InputTextModule, ToastModule],
	providers: [DialogService],
	templateUrl: './event-list.component.html',
	styleUrls: ['./event-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnDestroy {
	protected readonly eventService: EventService = inject(EventService);
	private readonly dialogService: DialogService = inject(DialogService);

	private inviteDialogRef: DynamicDialogRef;

	// TODO: add filtering by date
	protected $events = computed(
		() => this.eventService.$events(),
		// this.eventService.$events().filter((e) => {
		// 	const now = new Date().getTime();
		// 	const start = new Date(e.start).getTime();
		// 	const isNear = Math.floor(Math.abs(start - now) / (1000 * 60 * 60 * 24)) < 2;
		// 	return isNear;
		// }),
	);

	constructor() {
		this.eventService.loadEvents();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected showInviteModal(eventId: string) {
		const inviteAddress = window.location.origin + '/registration/' + eventId;

		this.inviteDialogRef = this.dialogService.open(InviteDialogComponent, {
			header: 'Invite address',
			width: '50%',
			contentStyle: { overflow: 'auto' },
			data: {
				address: inviteAddress,
			},
		});
	}

	public ngOnDestroy() {
		if (this.inviteDialogRef) {
			this.inviteDialogRef.close();
		}
	}
}
