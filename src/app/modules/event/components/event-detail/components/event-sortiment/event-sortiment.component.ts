import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { TableModule } from 'primeng/table';

@Component({
	selector: 'app-event-sortiment',
	standalone: true,
	imports: [CommonModule, ButtonModule, SharedModule, TableModule, DropdownModule, FormsModule, InputGroupModule],
	templateUrl: './event-sortiment.component.html',
	styleUrls: ['./event-sortiment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSortimentComponent {
	public $options = input<IKeg[]>([], { alias: 'options' });
	public $label = input<string>('', { alias: 'label' });
	public $dropdownSelectButtonText = input<string>('Vybrat', { alias: 'dropdownSelectButtonText' });

	public select = output<IKeg>();

	protected selectedSortiment: IKeg | null  = null;

	protected propagateSortiment(value: IKeg | null) {
		if(!value) {
			return
		}
		this.selectedSortiment = value;
		this.select.emit(value);
	}
}
