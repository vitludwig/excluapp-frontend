import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { filter, tap } from 'rxjs';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { TopbarComponent } from './layout/components/topbar/topbar.component';
import { LayoutService } from './layout/services/layout/layout.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastModule, ConfirmPopupModule],
	providers: [ConfirmationService],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	private readonly router = inject(Router);
	protected readonly layoutService = inject(LayoutService);

	constructor() {
		this.router.events
			.pipe(
				filter((e) => e instanceof NavigationEnd),
				tap(() => this.layoutService.$sidebarVisible.set(false)),
			)
			.subscribe();
	}
}
