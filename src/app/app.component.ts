import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { TopbarComponent } from './layout/components/topbar/topbar.component';
import { filter, map, tap } from 'rxjs';
import { LayoutService } from './layout/services/layout/layout.service';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastModule, ConfirmPopupModule],
	providers: [MessageService, ConfirmationService],
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
