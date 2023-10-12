import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleDashboardComponent } from './components/sale-dashboard/sale-dashboard.component';
import { LoginDialogComponent } from '../../layout/components/sidebar/components/login-dialog/login-dialog.component';

@Component({
	selector: 'app-sale',
	standalone: true,
	imports: [CommonModule, SaleDashboardComponent],
	templateUrl: './sale.component.html',
	styleUrls: ['./sale.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleComponent {}
