import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortPipe } from '../../../common/pipes/sort.pipe';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { UserService } from '../../../modules/user/services/user/user.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { FaceRecognitionService } from '../../../modules/user/services/face-recognition/face-recognition.service';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [MenuModule, SidebarModule, ButtonModule, DropdownModule, FormsModule, SortPipe, InputSwitchModule, InputTextModule, ReactiveFormsModule],
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService, MessageService],
})
export class SidebarComponent implements OnDestroy {
	protected readonly layoutService = inject(LayoutService);
	protected readonly authService: AuthService = inject(AuthService);
	protected readonly eventService = inject(EventService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);
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
				{
					label: 'Platby',
					routerLink: ['/admin/payments'],
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
