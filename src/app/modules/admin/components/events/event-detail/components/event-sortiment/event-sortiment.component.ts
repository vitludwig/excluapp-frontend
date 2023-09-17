import { ChangeDetectionStrategy, Component, computed, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { IKeg } from '../../../../../types/IKeg';
import { SortimentService } from '../../../../../services/sortiment/sortiment.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';

@Component({
	selector: 'app-event-sortiment',
	standalone: true,
	imports: [CommonModule, ButtonModule, SharedModule, TableModule, DropdownModule, FormsModule, RouterLink],
	templateUrl: './event-sortiment.component.html',
	styleUrls: ['./event-sortiment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSortimentComponent {
	protected readonly sortimentService = inject(SortimentService);

	@Input()
	public options: IKeg[] = [];

	@Input()
	public label: string = '';

	@Input()
	public set sortiment(value: IKeg[]) {
		this.$sortiment.set(value);
	}

	@Output()
	public sortimentChange: EventEmitter<IKeg[]> = new EventEmitter<IKeg[]>();

	protected $sortiment = signal<IKeg[]>([]);

	protected selectedSortiment: IKeg | null = null;

	constructor() {}

	protected addSortiment(value: IKeg | null) {
		if (!value) {
			return;
		}

		this.$sortiment.update((sortiment) => [...sortiment, value]);
		this.selectedSortiment = null;
		this.propagateSortiment();
	}

	protected removeSortiment(id: number) {
		// this.sortiment = this.sortiment.filter((value) => value.id !== id);
		this.$sortiment.update((sortiment) => sortiment.filter((value) => value.id !== id));
		this.propagateSortiment();
	}

	private propagateSortiment() {
		this.sortimentChange.emit(this.$sortiment());
	}
}
