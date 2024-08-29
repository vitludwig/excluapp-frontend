import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { SortPipe } from '@common/pipes/sort.pipe';
import { NotificationService } from '@common/services/notification.service';
import { EventStore } from '@modules/event/event.store';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';

@Component({
	selector: 'app-event-list',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, RouterLink, InputTextModule, ToastModule, ConfirmComponent, SortPipe],
	providers: [DialogService],
	templateUrl: './event-list.component.html',
	styleUrls: ['./event-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnDestroy {
	protected readonly eventStore = inject(EventStore);

	private readonly dialogService: DialogService = inject(DialogService);
	private notificationService = inject(NotificationService);

	private inviteDialogRef: DynamicDialogRef;

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected showInviteModal(eventId: string) {
		const inviteAddress = window.location.origin + '/registration/' + eventId;

		this.inviteDialogRef = this.dialogService.open(InviteDialogComponent, {
			header: 'Adresa události',
			width: '50%',
			contentStyle: { overflow: 'auto' },
			data: {
				address: inviteAddress,
			},
		});
	}

	protected removeEvent(eventId: number) {
		this.eventStore.remove(eventId).subscribe({
			error: () => this.notificationService.error('Nepodařilo se smazat událost'),
		});
	}

	public ngOnDestroy() {
		if (this.inviteDialogRef) {
			this.inviteDialogRef.close();
		}
	}
}
