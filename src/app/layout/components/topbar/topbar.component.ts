import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../services/layout/layout.service';
import { ActivationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { EventService } from '../../../modules/admin/services/event/event.service';
import { FormsModule } from '@angular/forms';
import { IEvent } from '../../../modules/admin/types/IEvent';

@Component({
	selector: 'app-topbar',
	standalone: true,
	imports: [CommonModule, ToolbarModule, ButtonModule, DropdownModule, FormsModule],
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
	protected readonly layoutService = inject(LayoutService);
	protected readonly eventService = inject(EventService);
	private readonly router = inject(Router);

	constructor() {
		this.router.events
			.pipe(
				filter((e): e is ActivationEnd => e instanceof ActivationEnd && e.snapshot.data.hasOwnProperty('title')),
				tap((e: ActivationEnd) => {
					this.layoutService.$topBarTitle.set(e.snapshot.data['title'] ?? '');
				}),
			)
			.subscribe();
	}

	protected toggleSidebar(): void {
		this.layoutService.$sidebarVisible.set(!this.layoutService.$sidebarVisible());
	}
}
