import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { IKeg } from '../../../../../types/IKeg';

@Component({
	selector: 'app-event-sortiment',
	standalone: true,
	imports: [CommonModule, ButtonModule, SharedModule, TableModule, DropdownModule, FormsModule, RouterLink],
	templateUrl: './event-sortiment.component.html',
	styleUrls: ['./event-sortiment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSortimentComponent {
	@Input()
	public options: IKeg[] = [];

	@Input()
	public label: string = '';

	@Output()
	public select: EventEmitter<IKeg> = new EventEmitter<IKeg>();

	protected selectedSortiment: IKeg | null = null;

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
