import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SortPipe } from '@common/pipes/sort.pipe';
import { EventStore } from '@modules/event/event.store';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { IEventPayday } from '@modules/event/types/IEventPaydayStatistics';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { map, Observable } from 'rxjs';
import { PaydayTableComponent } from '../payday-table/payday-table.component';

@Component({
	selector: 'app-payday',
	standalone: true,
	imports: [
		CommonModule,
		MultiSelectModule,
		FormsModule,
		DropdownModule,
		ButtonModule,
		TableModule,
		SortPipe,
		PaydayTableComponent,
		ToggleButtonModule,
		InputSwitchModule,
		MessageModule,
		InputTextModule,
		RouterLink,
	],
	templateUrl: './payday.component.html',
	styleUrls: ['./payday.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayComponent {
	private readonly eventStore = inject(EventStore);

	protected readonly eventService = inject(EventService);
	protected readonly sortimentService = inject(SortimentService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $paydayResult = signal<Observable<IEventPayday> | null>(null);
	protected $events = computed(() => {
		const events = this.eventStore.events();
		if (this.$showOnlyNotPaidEvents()) {
			return events.filter((event) => {
				const eventKegs = this.$copySortiment().filter((keg) => event.kegs.includes(keg.id));
				return eventKegs.some((keg) => !keg.isCashed);
			});
		}

		return events;
	});
	protected $eventsWithFullKegs = computed(() => {
		const selectedEvents = this.$selectedEvents();
		return selectedEvents.filter((event) => {
			const eventKegs = this.$copySortiment().filter((keg) => event.kegs.includes(keg.id));
			return eventKegs.some((keg) => !keg.isEmpty);
		});
	});

	protected $showOnlyNotPaidEvents = signal<boolean>(true);
	protected $onlyUncashedKegs = signal<boolean>(false);
	private $copySortiment = signal<IKeg[]>([]);

	constructor() {
		this.loadSortiment();
	}

	/**
	 * We load sortiment, so we can filter out events with paid/unpaid kegs
	 * TODO: get events to make payday of from server
	 */
	private loadSortiment() {
		this.sortimentService
			.getSortimentList(undefined, { isOriginal: false })
			.pipe(takeUntilDestroyed())
			.subscribe((data) => {
				this.$copySortiment.set(data);
			});
	}

	protected createPayday(): void {
		const result = this.eventService
			.getEventPayday(
				this.$selectedEvents().map((e) => e.id),
				this.$onlyUncashedKegs(),
			)
			.pipe(
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

	/**
	 * Refresh local array of all copy sortiment with new values from server
	 * for example if user sets keg as empty
	 * @protected
	 */
	protected refreshEventsWithFullKegs() {
		const eventKegs = this.$selectedEvents().flatMap((event) => event.kegs);

		this.sortimentService
			.getSortimentList(eventKegs)
			.pipe(
				map((kegs) =>
					kegs.reduce((obj: { [index: number]: IKeg }, item) => {
						obj[item.id] = item
						return obj;
					}, {}),
				),
			)
			.subscribe((newKegs) => {
				this.$copySortiment.update((sortiment) => {
					return sortiment.map((s) => newKegs[s.id] ?? s);
				});
			});
	}
}
