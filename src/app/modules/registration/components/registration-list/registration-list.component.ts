import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { EventService } from '../../../admin/services/event/event.service';
import { RouterLink } from '@angular/router';

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

	protected $events = computed(() =>
		this.eventService.$events().filter((e) => {
			const now = new Date().getTime();
			const start = new Date(e.start).getTime();
			return Math.floor(Math.abs(start - now) / (1000 * 60 * 60 * 24)) < 2; // filter events, that starts max day ago, so we dont show old events
		}),
	);

	constructor() {
		this.eventService.loadEvents();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}
}
