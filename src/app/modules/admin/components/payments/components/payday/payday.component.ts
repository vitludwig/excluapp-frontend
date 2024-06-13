import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { IEventPayday } from '../../../../types/IEventPaydayStatistics';
import { IKeg } from '../../../../types/IKeg';
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
	protected $paydayResult = signal<Observable<IEventPayday> | null>(null);
	protected $events = computed(() => {
		const events = this.eventService.$events();
		if (this.$showOnlyNotPaidEvents()) {
			return events.filter((event) => {
				const eventKegs = this.$copySortiment().filter((keg) => event.kegs.includes(keg.id));
				return eventKegs.some((keg) => !keg.isCashed);
			});
		}

		return events;
	});

	protected $showOnlyNotPaidEvents = signal<boolean>(true);
	private $copySortiment = signal<IKeg[]>([]);

	constructor() {
		// TODO: get events to make payday of from server
		this.sortimentService
			.getSortimentList(undefined, { isOriginal: false })
			.pipe(takeUntilDestroyed())
			.subscribe((data) => {
				this.$copySortiment.set(data);
			});
	}

	protected createPayday(): void {
		const result = forkJoin(this.$selectedEvents().map((event) => this.eventService.getEventPayday(event.id))).pipe(
			map((statistics) => {
				return statistics.reduce((accumulator, current) => {
					// merge more events into one payday
					current.payday.map((c) => {
						let found = accumulator.payday.find((element) => element.userId === c.userId);
						if (found) {
							found.finalPrice = Number(found.finalPrice) + Number(c.finalPrice);
							found.amount = Number(found.amount) + Number(c.amount);
						} else {
							accumulator.payday.push(c);
						}
					});
					accumulator.allAddedCosts += current.allAddedCosts;

					return accumulator;
				});
			}),
		);

		this.$paydayResult.set(result);
	}
}
