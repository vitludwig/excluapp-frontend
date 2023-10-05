import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { EventService } from '../../../../services/event/event.service';
import { IEvent } from '../../../../types/IEvent';
import { FormsModule } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { IEventKegsStatistics } from '../../../../types/IEventKegsStatistics';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-event-statistics',
	standalone: true,
	imports: [CommonModule, DropdownModule, FormsModule, ChartModule, ButtonModule, TableModule, TooltipModule],
	templateUrl: './event-statistics.component.html',
	styleUrls: ['./event-statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatisticsComponent {
	protected eventService = inject(EventService);
	protected $selectedEvent = signal<IEvent | null>(this.eventService.$activeEvent());

	protected $kegsStatistics = computed(() => {
		const event = this.$selectedEvent();
		if (event) {
			return this.eventService.getKegsStatistics(event.id).pipe(
				switchMap((statistics) => {
					console.log('statistics', statistics);
					return of(this.createKegsChartData(statistics));
				}),
			);
		}

		return null;
	});

	protected $usersStatistics: Signal<any> = computed(() => {
		const event = this.$selectedEvent();
		if (event) {
			return this.eventService.getUsersStatistics(event.id);
		}

		return [];
	});

	protected chartOptions = {};

	public get selectedEvent(): IEvent | null {
		return this.$selectedEvent();
	}

	public set selectedEvent(value: IEvent) {
		this.$selectedEvent.set(value);
	}

	private createKegsChartData(value: IEventKegsStatistics[]): any {
		// TODO: create colors according to keg type and dynamically add them by amount of kegs
		return {
			labels: value.map((v) => v.kegName),
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
