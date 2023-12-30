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
export class EventSortimentComponent implements OnInit {
	@Input()
	public options: IKeg[] = [];

	@Input()
	public label: string = '';

	@Output()
	public select: EventEmitter<IKeg> = new EventEmitter<IKeg>();

	protected selectedSortiment: IKeg | null = null;

	constructor() {}

	public ngOnInit(): void {
		console.log('options', this.options);
	}

	protected addSortiment(value: IKeg | null) {
		if (!value) {
			return;
		}

		this.selectedSortiment = null;
		this.propagateSortiment(value);
	}

	private propagateSortiment(value: IKeg) {
		this.select.emit(value);
	}
}
