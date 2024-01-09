import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Observable, forkJoin, map } from 'rxjs';
import { SortPipe } from '../../../../../../common/pipes/sort.pipe';
import { EventService } from '../../../../services/event/event.service';
import { SortimentService } from '../../../../services/sortiment/sortiment.service';
import { IEvent } from '../../../../types/IEvent';
import { IEventPaydayStatistics } from '../../../../types/IEventPaydayStatistics';
import { PaydayTableComponent } from '../payday-table/payday-table.component';

@Component({
	selector: 'app-payday',
	standalone: true,
	imports: [CommonModule, MultiSelectModule, FormsModule, DropdownModule, ButtonModule, TableModule, SortPipe, PaydayTableComponent, ToggleButtonModule, InputSwitchModule],
	templateUrl: './payday.component.html',
	styleUrls: ['./payday.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayComponent {
	protected readonly eventService = inject(EventService);
	protected readonly sortimentService = inject(SortimentService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $paydayResult = signal<Observable<IEventPaydayStatistics[]> | null>(null);
	protected $events = computed(() => {
		const events = this.eventService.$events();
		if (this.$showOnlyNotPaidEvents()) {
			return events.filter((event) => {
				const eventKegs = this.sortimentService.$copySortiment().filter((keg) => event.kegs.includes(keg.id));
				console.log(event.name, eventKegs);
				return eventKegs.some((keg) => !keg.isCashed);
			});
		}

		return events;
	});
	protected $showOnlyNotPaidEvents = signal<boolean>(true);

	protected createPayday(): void {
		const result = forkJoin(this.$selectedEvents().map((event) => this.eventService.getEventPayday(event.id))).pipe(
			map((statistics) => {
				return statistics.reduce((accumulator, current) => {
					current.map((c) => {
						let found = accumulator.find((element) => element.userId === c.userId);
						if (found) {
							found.price = Number(found.price) + Number(c.price);
							found.amount = Number(found.amount) + Number(c.amount);
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
