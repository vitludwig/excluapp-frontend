import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NotificationService } from '@common/services/notification.service';
import { IEventPayday } from '@modules/event/types/IEventPaydayStatistics';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
	selector: 'app-payday-table',
	standalone: true,
	imports: [ButtonModule, SharedModule, TableModule, DialogModule],
	templateUrl: './payday-table.component.html',
	styleUrls: ['./payday-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayTableComponent {
	private readonly notificationService = inject(NotificationService);

	protected $showPaydayDialog = signal<boolean>(false);
	protected $paydayResult = signal<string>('');

	public $data = input.required<IEventPayday, IEventPayday>({
		alias: 'data',
		transform: (value) => {
			value.payday.sort((a, b) => {
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
			.payday.map((value) => {
				return `${value.name}: ${value.finalPrice}Kč`;
			})
			.join('\n');
		if (window.isSecureContext) {
			await navigator.clipboard.writeText(result);
			this.notificationService.success('Zkopírováno do schránky');
		} else {
			this.$paydayResult.set(result);
			this.$showPaydayDialog.set(true);
		}
	}
}
