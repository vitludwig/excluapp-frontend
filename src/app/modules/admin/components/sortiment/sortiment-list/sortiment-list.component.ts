import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { switchMap } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';

@Component({
	selector: 'app-sortiment-list',
	standalone: true,
	imports: [
		CommonModule,
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
	],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentListComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);

	protected $kegs = computed(() => {
		let result = this.sortimentService.$allSortiment();

		if (this.$filter().includes('inEvent')) {
			result = result.filter((k) => k.event);
		}
		if (this.$filter().includes('empty')) {
			result = result.filter((k) => k.isEmpty);
		} else {
			result = result.filter((k) => !k.isEmpty);
		}

		return result;
	});

	protected filterOptions: { name: string; value: string }[] = [
		{ name: 'Prázdné', value: 'empty' },
		{ name: 'Na párty', value: 'inEvent' },
	];
	protected filter: string[] = [];
	protected $filter = signal(this.filter);

	constructor() {
		this.sortimentService.loadSortiment();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected removeKeg(id: string) {
		this.sortimentService
			.removeSortiment(id)
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected emptyKeg(id: number) {
		this.sortimentService
			.updateSortiment(id, { isEmpty: true })
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected filterKegs(value: string[]) {
		this.$filter.set(value);
	}
}
