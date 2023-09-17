import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

	constructor() {
		this.eventService.loadEvents();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}
}
