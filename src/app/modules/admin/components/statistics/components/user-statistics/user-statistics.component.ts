import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-user-statistics',
	standalone: true,
	imports: [],
	templateUrl: './user-statistics.component.html',
	styleUrls: ['./user-statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatisticsComponent {}
