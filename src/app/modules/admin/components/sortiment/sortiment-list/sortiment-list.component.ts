import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { DialogService } from 'primeng/dynamicdialog';
import { IsIncludedPipe } from '../../../../../common/pipes/is-included.pipe';
import { SortimentListTableComponent } from './components/sortiment-list-table/sortiment-list-table.component';
import { TabViewModule } from 'primeng/tabview';
import { IKeg } from '../../../types/IKeg';

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
	],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService],
})
export class SortimentListComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);

	protected $originalKegs = computed(() => {
		let result = this.sortimentService.$originalSortiment();

		return this.applyFilter(this.$filter(), result);
	});

	protected $copyKegs = computed(() => {
		let result = this.sortimentService.$copySortiment();

		return this.applyFilter(this.$filter(), result);
	});

	protected $filter = signal<string[]>([]);

	protected toggleFilter(filter: string) {
		this.$filter.update((filters) => {
			if (filters.includes(filter)) {
				return filters.filter((f) => f !== filter);
			} else {
				return [...filters, filter];
			}
		});
	}

	private applyFilter(filter: string[], data: IKeg[]): IKeg[] {
		let result;

		if (filter.includes('inEvent')) {
			result = data.filter((k) => k.event);
		}
		if (filter.includes('empty')) {
			result = data.filter((k) => k.isEmpty);
		} else {
			result = data.filter((k) => !k.isEmpty);
		}

		return result;
	}
}
