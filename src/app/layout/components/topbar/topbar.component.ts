import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../services/layout/layout.service';
import { ActivationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
@Component({
	selector: 'app-topbar',
	standalone: true,
	imports: [ToolbarModule, ButtonModule, DropdownModule, FormsModule],
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
	protected readonly layoutService = inject(LayoutService);
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
