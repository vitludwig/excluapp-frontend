import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { EventService } from '../../../services/event/event.service';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { IEvent } from '../../../types/IEvent';
import { IKeg } from '../../../types/IKeg';
import { EventSortimentComponent } from './components/event-sortiment/event-sortiment.component';

@Component({
	selector: 'app-event-detail',
	standalone: true,
	imports: [ReactiveFormsModule, InputTextModule, CalendarModule, TableModule, RouterLink, EventSortimentComponent, TooltipModule, ConfirmDialogModule, ConfirmComponent, JsonPipe],
	providers: [ConfirmationService],
	templateUrl: './event-detail.component.html',
	styleUrls: ['./event-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent {
	private readonly eventService: EventService = inject(EventService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly messageService = inject(MessageService);
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);

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
	protected originalKegs: IKeg[] = [];

	protected $eventKegs = signal<IKeg[]>([]);
	// get existing kegs, that are not "original" kegs and are not connected to this event
	protected $existingKegs = computed(() => {
		const eventKegs = this.$eventKegs() ?? [];
		return this.sortimentService.$copySortiment().filter((k) => !k.isOriginal && !k.isEmpty && !eventKegs.some((e) => e.id === k.id));
	});

	constructor() {
		this.eventId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

		if (this.eventId) {
			this.loadEvent(this.eventId);
		}
	}

	protected async onSubmit() {
		const existingKegs = this.$eventKegs();
		const newKegPromises = [];
		const existingKegsToAdd: IKeg[] = []; // kegs from previous events to add
		const kegsToAdd: IKeg[] = existingKegs.filter((k) => !this.originalKegs.map((o) => o.id).includes(k.id)); // kegs that were not originally in event

		// TODO: rewirte mroe reactively
		if (kegsToAdd) {
			for (const keg of kegsToAdd) {
				if (keg.isOriginal) {
					keg.isOriginal = false;
					keg.isEmpty = false;
					// @ts-ignore
					delete keg.id; // TODO: create proper keg dtos
					newKegPromises.push(firstValueFrom(this.sortimentService.addSortiment(keg)));
				} else {
					existingKegsToAdd.push(keg);
				}
			}
		}

		const newKegsToAdd = await Promise.all(newKegPromises);

		let request: Observable<IEvent>;

		if (this.eventId) {
			request = this.eventService.updateEvent(this.eventId, this.form.value as IEvent);
		} else {
			request = this.eventService.addEvent(this.form.value as IEvent);
		}
		const event = await firstValueFrom(request);
		await this.processEventKegs(event, newKegsToAdd, existingKegsToAdd);

		this.router.navigate(['/admin/events']);
	}

	private async processEventKegs(event: IEvent, newKegsToAdd: IKeg[], existingKegsToAdd: IKeg[]): Promise<void> {
		for (const keg of [...newKegsToAdd, ...existingKegsToAdd]) {
			await firstValueFrom(this.sortimentService.addKegToEvent(event.id, keg.id));
			this.sortimentService.$allSortiment.update((kegs) => [...kegs, keg]);
		}

		const existingKegIds = this.$eventKegs().map((k) => k.id);
		const kegsToRemove = this.originalKegs.filter((k) => !existingKegIds.includes(k.id));

		for (const keg of kegsToRemove) {
			await firstValueFrom(this.sortimentService.removeKegFromEvent(event.id, keg.id));
		}
	}

	protected addKeg(keg: IKeg) {
		keg.isActive = true;
		this.$eventKegs.update((kegs) => [...kegs, keg]);
	}

	protected removeKeg(id: number) {
		this.$eventKegs.update((kegs) => kegs.filter((k) => k.id !== id));
	}

	protected openToggleConfirm(keg: IKeg) {
		if (keg.isActive) {
			// we are deactivating keg, so we ask if it is empty
			this.confirmationService.confirm({
				header: 'Je sud prázdný?',
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				accept: () => {
					this.setKegActive(keg, !keg.isActive, true);
				},
				reject: () => {
					this.setKegActive(keg, !keg.isActive, false);
				},
			});
		} else {
			this.setKegActive(keg, !keg.isActive, false);
		}
	}

	private setKegActive(keg: IKeg, value: boolean, isEmpty: boolean) {
		this.$eventKegs.update((kegs) =>
			kegs.map((k) => {
				if (k.id === keg.id) {
					k.isActive = value;
					k.isEmpty = isEmpty;
				}

				return k;
			}),
		);

		if (this.eventId) {
			const message = `${keg.name} ${value ? 'aktivován' : 'deaktivován'}`;
			this.sortimentService
				.updateSortiment(keg.id, { isActive: value, isEmpty })
				.pipe(tap(() => this.messageService.add({ severity: 'success', summary: 'Olé!', detail: message })))
				.subscribe();
		}
	}

	private loadEvent(id: number) {
		this.eventService
			.getEvent(id)
			.pipe(
				map((event) => {
					event.start = new Date(event.start);
					event.end = new Date(event.end);
					event.kegs = event.kegs.map((k) => +k);

					const eventKegs = this.sortimentService.$allSortiment().filter((s) => event.kegs.includes(s.id));

					this.originalKegs = eventKegs;
					this.form.patchValue(event);
					this.$eventKegs.set(eventKegs);
				}),
			)
			.subscribe();
	}
}
