import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortPipe } from '@common/pipes/sort.pipe';
import { AuthService } from '@common/services/auth.service';
import { SettingsService } from '@common/services/settings.service';
import { SettingsStore } from '@common/state/stores/settings.store';
import { EventStore } from '@modules/event/event.store';
import { EventService } from '@modules/event/services/event/event.service';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { FaceRecognitionService } from '@modules/user/services/face-recognition/face-recognition.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { SidebarModule } from 'primeng/sidebar';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../services/layout/layout.service';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [
		MenuModule,
		SidebarModule,
		ButtonModule,
		DropdownModule,
		FormsModule,
		SortPipe,
		InputSwitchModule,
		InputTextModule,
		ReactiveFormsModule,
		MultiSelectModule,
		AsyncPipe,
		JsonPipe,
	],
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService],
})
export class SidebarComponent implements OnDestroy {
	protected eventStore = inject(EventStore);
	protected settingsStore = inject(SettingsStore);
	protected sortimentStore = inject(SortimentStore);

	protected readonly layoutService = inject(LayoutService);
	protected readonly authService = inject(AuthService);
	protected readonly eventService = inject(EventService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);
	protected readonly settingsService = inject(SettingsService);
	private readonly dialogService = inject(DialogService);
	private readonly messageService = inject(MessageService);
	private readonly sortimentService = inject(SortimentService);

	protected $menuItems = computed(() => {
		if (this.authService.$isLogged()) {
			return [...this.defaultMenuItems, ...this.adminMenuItems];
		}
		return this.defaultMenuItems;
	});

	protected setActiveEvent(id: number) {
		this.eventStore.setActiveEvent(id);
	}

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
					label: 'Zapisování piv',
					routerLink: ['/party'],
				},
				{
					label: 'Registrace',
					routerLink: ['/registration'],
				},
				{
					label: 'Infoporno',
					routerLink: ['/admin/statistics'],
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
					label: 'Platby',
					routerLink: ['/admin/payments'],
				},
			],
		},
	];

	private unsubscribe$: Subject<void> = new Subject<void>();

	protected showLoginDialog() {
		this.loginDialogRef = this.dialogService.open(LoginDialogComponent, {
			header: 'Přihlásit se',
			width: '400px',
			baseZIndex: 10000,
		});

		this.loginDialogRef.onClose.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string) => {
			const isCorrect = this.authService.login(result);

			if (isCorrect) {
				this.messageService.add({ severity: 'success', summary: 'Přihlášení úspěšné', detail: 'Vítej!' });
			} else {
				this.messageService.add({ severity: 'error', summary: 'Nopity nope', detail: 'Špatné heslo!' });
			}
		});
	}

	protected reloadPage() {
		window.location.reload();
	}

	public ngOnDestroy() {
		if (this.loginDialogRef) {
			this.loginDialogRef.close();
		}
		this.unsubscribe$.next();
	}
}
