import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SortPipe } from '@common/pipes/sort.pipe';
import { AuthService } from '@common/services/auth.service';
import { IPChartData } from '@common/types/IPChartData';
import { EventStore } from '@modules/event/event.store';
import { IEvent } from '@modules/event/types/IEvent';
import { IEventKegsStatistics, IUsersStatistics } from '@modules/event/types/IEventKegsStatistics';
import { IEventPayday } from '@modules/event/types/IEventPaydayStatistics';
import { PaydayTableComponent } from '@modules/payment/components/payday-table/payday-table.component';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, of, switchMap } from 'rxjs';
import { StatisticsService } from "@modules/statistics/services/statistics.service";

@Component({
	selector: 'app-event-statistics',
	standalone: true,
	imports: [CommonModule, DropdownModule, FormsModule, ChartModule, ButtonModule, TableModule, TooltipModule, PaydayTableComponent, SortPipe],
	templateUrl: './event-statistics.component.html',
	styleUrls: ['./event-statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatisticsComponent {
	protected readonly eventStore = inject(EventStore);
	protected readonly statisticsService: StatisticsService = inject(StatisticsService);
	protected readonly authService: AuthService = inject(AuthService);

	protected $selectedEvent = signal<IEvent | null>(this.eventStore.activeEvent());
	protected $paydayResult = signal<Observable<IEventPayday> | null>(null);

	protected $kegsStatistics = computed(() => {
		const event = this.$selectedEvent();
		if (event) {
			return this.statisticsService.getKegsStatistics(event.id).pipe(
				switchMap((statistics) => {
					return of(this.createKegsChartData(statistics));
				}),
			);
		}

		return null;
	});

	protected $usersStatistics: Signal<Observable<IUsersStatistics[]>> = computed(() => {
		const event = this.$selectedEvent();
		if (event) {
			return this.statisticsService.getUsersStatistics(event.id);
		}

		return of([]);
	});

	protected chartOptions = {};

	public get selectedEvent(): IEvent | null {
		return this.$selectedEvent();
	}

	public set selectedEvent(value: IEvent) {
		this.$selectedEvent.set(value);
	}

	private createKegsChartData(value: IEventKegsStatistics[]): IPChartData {
		// TODO: create colors according to keg type and dynamically add them by amount of kegs
		value.sort((a, b) => (a.volume > b.volume ? -1 : 1));
		return {
			labels: value.map((v) => `${v.kegName} (${v.kegVolume}l) [ks]`),
			datasets: [
				{
					label: 'Pivínko',
					data: value.map((v) => v.volume / 0.5),
					backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
					borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
					borderWidth: 1,
				},
			],
		};
	}
}
