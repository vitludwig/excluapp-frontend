import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { tap } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-sortiment-list',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, SharedModule, TableModule, RouterLink, InputSwitchModule, FormsModule],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentListComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);

	protected $onlyEventKegs = signal<boolean>(true);
	protected $kegs = computed(() => {
		if (this.$onlyEventKegs()) {
			return this.sortimentService.$copySortiment();
		}
		return this.sortimentService.$allSortiment();
	});

	public get onlyEventKegs(): boolean {
		return this.$onlyEventKegs();
	}

	public set onlyEventKegs(value: boolean) {
		this.$onlyEventKegs.set(value);
	}

	constructor() {
		this.sortimentService.loadSortiment();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected removeSortiment(id: string) {
		this.sortimentService
			.removeSortiment(id)
			.pipe(tap(() => this.sortimentService.loadSortiment().subscribe()))
			.subscribe();
	}
}
