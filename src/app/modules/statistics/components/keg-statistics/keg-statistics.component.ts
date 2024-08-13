import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-keg-statistics',
	standalone: true,
	imports: [],
	templateUrl: './keg-statistics.component.html',
	styleUrls: ['./keg-statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KegStatisticsComponent {}
