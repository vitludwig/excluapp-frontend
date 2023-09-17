import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { EventService } from '../../../services/event/event.service';
import { IEvent } from '../../../types/IEvent';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom, map, tap } from 'rxjs';
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

	protected newKegs: IKeg[] = [];
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

		await Promise.all(promises);

		let request;
		const data = {
			...this.form.value,
			kegs: [...this.existingKegs.map((keg) => keg.id), ...newKegIds],
		} as IEvent;

		if (this.eventId) {
			request = this.eventService.updateEvent(this.eventId, data);
		} else {
			request = this.eventService.addEvent(data);
		}

		request
			.pipe(
				tap(() => {
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
					return event;
				}),
				tap((event) => {
					this.form.patchValue(event);
					this.eventKegs$.set(this.sortimentService.$allSortiment().filter((s) => event.kegs.includes(s.id)));
				}),
			)
			.subscribe();
	}
}
