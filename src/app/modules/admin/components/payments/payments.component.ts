import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TabViewModule } from 'primeng/tabview';
import { PaydayComponent } from './components/payday/payday.component';
import { DebtsComponent } from './components/debts/debts.component';

@Component({
	selector: 'app-payments',
	standalone: true,
	imports: [TabViewModule, PaydayComponent, DebtsComponent],
	templateUrl: './payments.component.html',
	styleUrls: ['./payments.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {}
