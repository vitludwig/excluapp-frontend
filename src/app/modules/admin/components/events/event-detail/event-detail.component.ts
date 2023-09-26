import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { EventService } from '../../../services/event/event.service';
import { IEvent } from '../../../types/IEvent';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first, firstValueFrom, map, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { IKeg } from '../../../types/IKeg';
import { EventSortimentComponent } from './components/event-sortiment/event-sortiment.component';
import { SortimentService } from '../../../services/sortiment/sortiment.service';

@Component({
	selector: 'app-event-detail',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, InputTextModule, CalendarModule, TableModule, RouterLink, EventSortimentComponent],
	templateUrl: './event-detail.component.html',
	styleUrls: ['./event-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent {
	private readonly eventService: EventService = inject(EventService);
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	protected eventId: number | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		start: new FormControl<Date | null>(null, Validators.required),
		end: new FormControl<Date | null>(null, Validators.required),
		capacity: new FormControl<number>(10, Validators.required),
	});

	/**
	 * Kegs, that were originaly in event on load
	 * @protected
	 */
	protected originalKegIds: number[] = [];
	/**
	 * Kegs, that were added to event
	 * @protected
	 */
	protected newKegs: IKeg[] = [];
	/**
	 * Modified array of kegs that were originaly in event
	 * @protected
	 */
	protected existingKegs: IKeg[] = [];

	protected eventKegs$ = signal<IKeg[]>([]);

	constructor() {
		this.eventId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

		if (this.eventId) {
			this.loadEvent(this.eventId);
		}
	}

	protected async onSubmit() {
		const newKegIds: number[] = [];
		const promises = [];
		if (this.newKegs) {
			for (const keg of this.newKegs) {
				keg.isOriginal = false;
				keg.isEmpty = false;
				// @ts-ignore
				delete keg.id; // TODO: create proper keg dtos
				promises.push(firstValueFrom(this.sortimentService.addSortiment(keg).pipe(tap((keg) => newKegIds.push(keg.id)))));
			}
		}

		const newKegs = await Promise.all(promises);

		let request;

		if (this.eventId) {
			request = this.eventService.updateEvent(this.eventId, this.form.value as IEvent);
		} else {
			request = this.eventService.addEvent(this.form.value as IEvent);
		}

		request
			.pipe(
				map((event) => {
					// TODO: dodelat odstranovani kegu z eventu
					for (const keg of newKegs) {
						this.sortimentService.addKegToEvent(event.id, keg.id).subscribe();
					}

					const existingKegIds = this.existingKegs.map((k) => k.id);
					const kegsToRemove = this.originalKegIds.filter((k) => !existingKegIds.includes(k));

					for (const kegId of kegsToRemove) {
						this.sortimentService.removeKegFromEvent(event.id, kegId).subscribe();
					}

					this.router.navigate(['/admin/events']);
				}),
			)
			.subscribe();
	}

	protected removeKeg(id: number) {
		this.eventKegs$.update((kegs) => kegs.filter((k) => k.id !== id));
	}

	private loadEvent(id: number) {
		this.eventService
			.getEvent(id)
			.pipe(
				map((event) => {
					event.start = new Date(event.start);
					event.end = new Date(event.end);
					event.kegs = event.kegs.map((k) => +k);

					this.originalKegIds = event.kegs;
					this.form.patchValue(event);
					this.eventKegs$.set(this.sortimentService.$allSortiment().filter((s) => event.kegs.includes(s.id)));
				}),
			)
			.subscribe();
	}
}
