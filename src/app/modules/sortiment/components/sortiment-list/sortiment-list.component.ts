import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { IsIncludedPipe } from '@common/pipes/is-included.pipe';
import { NotificationService } from '@common/services/notification.service';
import { SortimentListStore } from '@modules/sortiment/components/sortiment-list/sortiment-list.store';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { SortimentListTableComponent } from './components/sortiment-list-table/sortiment-list-table.component';

@Component({
	selector: 'app-sortiment-list',
	standalone: true,
	imports: [
		ButtonModule,
		InputTextModule,
		SharedModule,
		TableModule,
		RouterLink,
		InputSwitchModule,
		FormsModule,
		SelectButtonModule,
		TooltipModule,
		ConfirmComponent,
		IsIncludedPipe,
		SortimentListTableComponent,
		TabViewModule,
		AsyncPipe,
		JsonPipe,
	],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService, SortimentListStore],
})
export class SortimentListComponent {
	protected readonly sortimentListStore = inject(SortimentListStore);
	private readonly sortimentStore = inject(SortimentStore);
	private readonly notificationService = inject(NotificationService);

	public removeKeg(id: number) {
		this.sortimentStore.removeKeg(id).subscribe({
			next: () => this.notificationService.success('Sud odstraněn'),
			error: () => this.notificationService.error('Nepodařilo se odstranit sud'),
		});
	}

	public updateKeg(id: number, property: keyof IKeg, value: any) {
		this.sortimentStore.updateKeg(id, property, value).subscribe({
			next: () => this.notificationService.success('Sud upraven'),
			error: () => this.notificationService.error('Nepodařilo se upravit sud'),
		});
	}
}
