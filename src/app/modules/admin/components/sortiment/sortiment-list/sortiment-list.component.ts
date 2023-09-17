import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { tap } from 'rxjs';

@Component({
	selector: 'app-sortiment-list',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, SharedModule, TableModule, RouterLink],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentListComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);

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
