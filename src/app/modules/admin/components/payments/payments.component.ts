import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { PaydayComponent } from './components/payday/payday.component';
import { DebtsComponent } from './components/debts/debts.component';

@Component({
	selector: 'app-payments',
	standalone: true,
	imports: [CommonModule, TabViewModule, PaydayComponent, DebtsComponent],
	templateUrl: './payments.component.html',
	styleUrls: ['./payments.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {}
