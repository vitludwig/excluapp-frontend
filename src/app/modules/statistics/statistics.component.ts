import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TabViewModule } from 'primeng/tabview';
import { EventStatisticsComponent } from './components/event-statistics/event-statistics.component';
import { KegStatisticsComponent } from './components/keg-statistics/keg-statistics.component';
import { UserStatisticsComponent } from './components/user-statistics/user-statistics.component';
import { LeaderboardComponent } from "@modules/statistics/components/leaderboard/leaderboard.component";

@Component({
	selector: 'app-statistics',
	standalone: true,
	imports: [TabViewModule, EventStatisticsComponent, UserStatisticsComponent, KegStatisticsComponent, LeaderboardComponent],
	templateUrl: './statistics.component.html',
	styleUrls: ['./statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {}
