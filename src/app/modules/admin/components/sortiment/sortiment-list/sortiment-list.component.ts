import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { IsIncludedPipe } from '../../../../../common/pipes/is-included.pipe';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { ISortimentFilters } from '../../../services/sortiment/types/ISortimentFilters';
import { IKeg } from '../../../types/IKeg';
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
	providers: [DialogService],
})
export class SortimentListComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);

	protected $originalKegs = signal<IKeg[]>([]);
	protected $copyKegs = signal<IKeg[]>([]);

	// protected $sortiment = signal<IKeg[]>([]);

	protected $filter = signal<ISortimentFilters>({ isEmpty: false });

	constructor() {
		this.loadSortiment();
	}

	protected toggleFilter(filter: keyof ISortimentFilters) {
		this.$filter.update((filters) => {
			filters[filter] = !filters[filter];
			return filters;
		});
		this.loadSortiment();
	}

	protected loadSortiment() {
		// TODO: load new data and filters declaratively
		this.sortimentService.getSortimentList(undefined, this.$filter()).subscribe((kegs) => {
			this.$originalKegs.set(kegs.filter((k) => k.isOriginal));
			this.$copyKegs.set(kegs.filter((k) => !k.isOriginal));
		});
	}

	// public onKegDelete(kegId: number) {
	// 	this.$sortiment.update((kegs) => kegs.filter((k) => k.id !== kegId));
	// }
	//
	// public onKegEmptyStatusChange(newValue: { id: number; isEmpty: boolean }) {
	// 	this.$sortiment.update((kegs) => {
	// 		const keg = kegs.find((k) => k.id === newValue.id);
	// 		if (keg) {
	// 			keg.isEmpty = newValue.isEmpty;
	// 		}
	//
	// 		return kegs;
	// 	});
	// }
	//
	// public onKegDefectiveStatusChanged(newValue: { id: number; isDefective: boolean }) {
	// 	this.$sortiment.update((kegs) => {
	// 		const keg = kegs.find((k) => k.id === newValue.id);
	// 		if (keg) {
	// 			keg.isDefective = newValue.isDefective;
	// 		}
	//
	// 		return kegs;
	// 	});
	// }
}
