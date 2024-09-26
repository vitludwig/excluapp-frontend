import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatisticsService } from '@modules/statistics/services/statistics.service';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
	selector: 'app-leaderboard',
	standalone: true,
	imports: [AsyncPipe, TableModule, CalendarModule, ReactiveFormsModule, FormsModule, InputTextModule],
	templateUrl: './leaderboard.component.html',
	styleUrl: './leaderboard.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
	private readonly statisticsService = inject(StatisticsService);

	protected $startDate = signal<Date | null>(null);
	protected $endDate = signal<Date | null>(null);

	protected $data = computed(() => {
		let start;
		let end;
		if (this.$startDate()) {
			start = this.$startDate()?.toISOString() ?? undefined;
		}
		if (this.$endDate()) {
			end = this.$endDate()?.toISOString() ?? undefined;
		}

		return this.statisticsService.getAllUsersStatistics(start, end);
	});

	protected resetFilters() {
		this.$startDate.set(null);
		this.$endDate.set(null);
	}
}
