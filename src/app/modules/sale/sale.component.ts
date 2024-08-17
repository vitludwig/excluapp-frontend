import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { EventStore } from '@modules/event/event.store';
import { SaleDashboardComponent } from './components/sale-dashboard/sale-dashboard.component';

@Component({
	selector: 'app-sale',
	standalone: true,
	imports: [SaleDashboardComponent],
	templateUrl: './sale.component.html',
	styleUrls: ['./sale.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleComponent {
	protected readonly eventStore = inject(EventStore);
}
