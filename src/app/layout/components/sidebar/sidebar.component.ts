import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { LayoutService } from '../../services/layout/layout.service';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, MenuModule, SidebarModule],
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
	protected readonly layoutService = inject(LayoutService);

	protected items: MenuItem[] | undefined;

	public get visible(): boolean {
		return this.layoutService.$sidebarVisible();
	}

	public set visible(value: boolean) {
		this.layoutService.$sidebarVisible.set(value);
	}

	ngOnInit() {
		this.items = [
			{
				label: 'Party',
				icon: 'pi pi-fw pi-plus',
				items: [
					{
						label: 'Dashboard',
						routerLink: ['/party'],
					},
					{
						label: 'Registration',
						routerLink: ['/registration'],
					},
				],
			},
			{
				label: 'Admin',
				icon: 'pi pi-fw pi-plus',
				items: [
					{
						label: 'Events',
						routerLink: ['/admin/events'],
					},
					{
						label: 'Users',
						routerLink: ['/admin/users'],
					},
					{
						label: 'Sortiment',
						routerLink: ['/admin/sortiment'],
					},
					{
						label: 'Infoporno',
						routerLink: ['/admin/statistics'],
					},
				],
			},
		];
	}
}
