import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { EventService } from '../../../../services/event/event.service';
import { IEvent } from '../../../../types/IEvent';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { forkJoin, map, Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { SortPipe } from '../../../../../../common/pipes/sort.pipe';
import { PaydayTableComponent } from '../payday-table/payday-table.component';
import { IEventPaydayStatistics } from '../../../../types/IEventPaydayStatistics';

@Component({
	selector: 'app-payday',
	standalone: true,
	imports: [CommonModule, MultiSelectModule, FormsModule, DropdownModule, ButtonModule, TableModule, SortPipe, PaydayTableComponent],
	templateUrl: './payday.component.html',
	styleUrls: ['./payday.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayComponent {
	protected readonly eventService = inject(EventService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $paydayResult = signal<Observable<IEventPaydayStatistics[]> | null>(null);

	protected createPayday(): void {
		const result = forkJoin(this.$selectedEvents().map((event) => this.eventService.getEventPayday(event.id))).pipe(
			map((statistics) => {
				return statistics.reduce((accumulator, current) => {
					current.map((c) => {
						let found = accumulator.find((element) => element.userId === c.userId);
						if (found) {
							found.price = Number(found.price) + Number(c.price);
							found.volume = Number(found.volume) + Number(c.volume);
						} else {
							accumulator.push(c);
						}
					});
					return accumulator;
				});
			}),
		);
		this.$paydayResult.set(result);
	}
}