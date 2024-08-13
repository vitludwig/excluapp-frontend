import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

@Component({
	selector: 'app-registration-list',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, SharedModule, TableModule, RouterLink],
	templateUrl: './registration-list.component.html',
	styleUrls: ['./registration-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationListComponent {
	protected readonly eventService: EventService = inject(EventService);

	protected $events = computed(() => this.filterNearEvents(this.eventService.$events()));

	protected clearSearch(table: Table) {
		table.clear();
	}

	/**
	 * Return events, that starts max day ago and not ended yet (for continuous events
	 * @param events
	 * @private
	 */
	private filterNearEvents(events: IEvent[]): IEvent[] {
		const now = new Date().getTime();
		return events.filter((e) => {
			const start = new Date(e.start).getTime();
			const end = new Date(e.end).getTime();
			const isBeforeEventStart = Math.floor(Math.abs(start - now) / (1000 * 60 * 60 * 24)) < 2; // filter events, that starts max day ago, so we don't show old events
			const isAfterEventEnd = now > end;
			return isBeforeEventStart || !isAfterEventEnd;
		});
	}
}
