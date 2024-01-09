import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivationEnd, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { filter, tap } from 'rxjs';
import { LayoutService } from '../../services/layout/layout.service';
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
