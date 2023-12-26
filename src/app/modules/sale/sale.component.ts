import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SaleDashboardComponent } from './components/sale-dashboard/sale-dashboard.component';
import { LoginDialogComponent } from '../../layout/components/sidebar/components/login-dialog/login-dialog.component';
import { EventService } from '../admin/services/event/event.service';

@Component({
	selector: 'app-sale',
	standalone: true,
	imports: [SaleDashboardComponent],
	templateUrl: './sale.component.html',
	styleUrls: ['./sale.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleComponent {
	protected eventService = inject(EventService);
}
