import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { filter, fromEvent, map, merge, tap } from 'rxjs';
import { NotificationService } from './common/services/notification.service';
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
	private readonly notificationService = inject(NotificationService);
	protected readonly layoutService = inject(LayoutService);

	protected $isOnline = signal<boolean>(navigator.onLine);
	protected $showNetworkAlert = signal<boolean>(false);

	constructor() {
		this.router.events
			.pipe(
				takeUntilDestroyed(),
				filter((e) => e instanceof NavigationEnd),
				tap(() => this.layoutService.$sidebarVisible.set(false)),
			)
			.subscribe();

		this.initNetworkStatusCheck();
	}

	protected initNetworkStatusCheck(): void {
		merge(fromEvent(window, 'online'), fromEvent(window, 'offline'))
			.pipe(
				takeUntilDestroyed(),
				map(() => navigator.onLine),
			)
			.subscribe((newStatus) => {
				this.$showNetworkAlert.set(false);

				if (!this.$isOnline() && newStatus) {
					this.notificationService.success('Připojení k internetu je zpět!');
				}
				if (this.$isOnline() && !newStatus) {
					this.$showNetworkAlert.set(true);
				}

				this.$isOnline.set(newStatus);
			});
	}
}
