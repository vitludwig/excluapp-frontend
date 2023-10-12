import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { LayoutService } from '../../services/layout/layout.service';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { AuthService } from '../../../common/services/auth.service';
import { DropdownModule } from 'primeng/dropdown';
import { EventService } from '../../../modules/admin/services/event/event.service';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, MenuModule, SidebarModule, ButtonModule, DropdownModule, FormsModule],
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService, MessageService],
})
export class SidebarComponent implements OnDestroy {
	protected readonly layoutService = inject(LayoutService);
	protected readonly authService: AuthService = inject(AuthService);
	protected readonly eventService = inject(EventService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly messageService: MessageService = inject(MessageService);

	protected $items = computed(() => {
		if (this.authService.$isLogged()) {
			return [...this.defaultMenuItems, ...this.adminMenuItems];
		}
		return this.defaultMenuItems;
	});

	public get visible(): boolean {
		return this.layoutService.$sidebarVisible();
	}

	public set visible(value: boolean) {
		this.layoutService.$sidebarVisible.set(value);
	}

	private loginDialogRef: DynamicDialogRef | undefined;
	private defaultMenuItems: MenuItem[] = [
		{
			label: 'Párty',
			icon: 'pi pi-fw pi-plus',
			items: [
				{
					label: 'Dashboard',
					routerLink: ['/party'],
				},
				{
					label: 'Registrace',
					routerLink: ['/registration'],
				},
			],
		},
	];

	private adminMenuItems: MenuItem[] = [
		{
			label: 'Admin',
			icon: 'pi pi-fw pi-plus',
			items: [
				{
					label: 'Události',
					routerLink: ['/admin/events'],
				},
				{
					label: 'Uživatelé',
					routerLink: ['/admin/users'],
				},
				{
					label: 'Sudy',
					routerLink: ['/admin/sortiment'],
				},
				{
					label: 'Infoporno',
					routerLink: ['/admin/statistics'],
				},
			],
		},
	];

	protected showLoginDialog() {
		this.loginDialogRef = this.dialogService.open(LoginDialogComponent, {
			header: 'Přihlásit se',
			width: '400px',
			baseZIndex: 10000,
		});

		this.loginDialogRef.onClose.subscribe((result: string) => {
			const isCorrect = this.authService.login(result);
			console.log('isCorrect', isCorrect);
			if (isCorrect) {
				this.messageService.add({ severity: 'success', summary: 'Přihlášení úspěšné', detail: 'Vítej!' });
			} else {
				this.messageService.add({ severity: 'error', summary: 'Nopity nope', detail: 'Špatné heslo!' });
			}
		});
	}

	ngOnDestroy() {
		if (this.loginDialogRef) {
			this.loginDialogRef.close();
		}
	}
}
