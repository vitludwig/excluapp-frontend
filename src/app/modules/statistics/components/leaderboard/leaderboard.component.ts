import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { StatisticsService } from "@modules/statistics/services/statistics.service";
import { AsyncPipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

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
