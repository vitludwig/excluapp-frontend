import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { IEventPaydayStatistics } from '../../../../types/IEventPaydayStatistics';

@Component({
	selector: 'app-payday-table',
	standalone: true,
	imports: [ButtonModule, SharedModule, TableModule, DialogModule],
	templateUrl: './payday-table.component.html',
	styleUrls: ['./payday-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayTableComponent {
	private readonly messageService: MessageService = inject(MessageService);

	protected showPaydayDialog: boolean = false;
	protected paydayResult: string = '';

	public $data = input.required<IEventPaydayStatistics[], IEventPaydayStatistics[]>({
		alias: 'data',
		transform: (value) => {
			value.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			});

			return value;
		},
	});

	protected async copyPaydayResult(): Promise<void> {
		const result = this.$data()
			.map((value) => {
				return `${value.name}: ${value.price}Kč`;
			})
			.join('\n');
		if (window.isSecureContext) {
			await navigator.clipboard.writeText(result);
			this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Zkopírováno do schránky' });
		} else {
			this.paydayResult = result;
			this.showPaydayDialog = true;
		}
	}
}
