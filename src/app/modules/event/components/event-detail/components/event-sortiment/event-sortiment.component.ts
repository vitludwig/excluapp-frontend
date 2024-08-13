import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { TableModule } from 'primeng/table';

@Component({
	selector: 'app-event-sortiment',
	standalone: true,
	imports: [CommonModule, ButtonModule, SharedModule, TableModule, DropdownModule, FormsModule, RouterLink, InputGroupModule],
	templateUrl: './event-sortiment.component.html',
	styleUrls: ['./event-sortiment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSortimentComponent {
	public $options = input<IKeg[]>([], { alias: 'options' });
	public $label = input<string>('', { alias: 'label' });

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
