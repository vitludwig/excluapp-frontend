import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OrderListModule } from 'primeng/orderlist';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { NotificationService } from '../../../../../common/services/notification.service';
import { LayoutService } from '../../../../../layout/services/layout/layout.service';
import { EventService } from '../../../services/event/event.service';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { IEvent } from '../../../types/IEvent';
import { IKeg } from '../../../types/IKeg';
import { KegStatusDialogComponent } from '../../sortiment/components/keg-status-dialog/keg-status-dialog.component';
import { KegUsersStatisticsDialogComponent } from '../../sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { EventSortimentComponent } from './components/event-sortiment/event-sortiment.component';

@Component({
	selector: 'app-event-detail',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		InputTextModule,
		CalendarModule,
		TableModule,
		RouterLink,
		EventSortimentComponent,
		TooltipModule,
		ConfirmDialogModule,
		ConfirmComponent,
		JsonPipe,
		DividerModule,
		OrderListModule,
		AsyncPipe,
	],
	providers: [ConfirmationService, DialogService],
	templateUrl: './event-detail.component.html',
	styleUrls: ['./event-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent implements OnDestroy {
	private readonly eventService: EventService = inject(EventService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly layoutService = inject(LayoutService);
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);

	protected eventId: number | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		start: new FormControl<Date | null>(null, Validators.required),
		end: new FormControl<Date | null>(null, Validators.required),
		capacity: new FormControl<number>(20, Validators.required),
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

		//TODO: find out why this compututed fn is calling twice on load
		return this.sortimentService.getSortimentList(undefined, { isEmpty: false, isOriginal: false }).pipe(
			map((kegs) => {
				return kegs.filter((k) => !eventKegs.some((e) => e.id === k.id));
			}),
		);
	});

	protected $originalKegs = toSignal(this.sortimentService.getSortimentList(undefined, { isOriginal: true }));

	private kegStatusDialogRef: DynamicDialogRef | undefined;
	private kegUserStatisticsDialogRef: DynamicDialogRef | undefined;

	constructor() {
		this.eventId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

		if (this.eventId) {
			this.loadEvent(this.eventId);
		} else {
			this.initDefaultFormValues();
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
		const newEvent = event;
		for (const keg of [...newKegsToAdd, ...existingKegsToAdd]) {
			await firstValueFrom(this.sortimentService.addKegToEvent(event.id, keg.id));
			newEvent.kegs.push(keg.id); //newEvent to nevidi ve workeru, protoze to projde dal nez se dokonci request v parent metode!!!!!!!!
		}

		const existingKegIds = this.$eventKegs().map((k) => k.id);
		const kegsToRemove = this.originalKegs.filter((k) => !existingKegIds.includes(k.id));

		for (const keg of kegsToRemove) {
			await firstValueFrom(this.sortimentService.removeKegFromEvent(event.id, keg.id));
			newEvent.kegs = newEvent.kegs.filter((k) => k !== keg.id);
		}

		/**
		 * Locally update events, so newly added/removed kegs would be there
		 * Normally this update is done on Event update/create, but this method have to be called after event update/create, because we might not have event id before (on create)
		 */
		this.eventService.$events.update((events) => events.map((e) => (e.id === event.id ? newEvent : e)));

		// load active event data if it was updated
		if (event.id === this.eventService.$activeEventId()) {
			this.eventService.$activeEventId.set(event.id);
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

	protected showKegStatusDialog(kegId: number) {
		this.kegStatusDialogRef = this.dialogService.open(KegStatusDialogComponent, {
			header: 'Vypito ze sudu',
			width: '400px',
			data: {
				kegId,
			},
			dismissableMask: true,
		});
	}

	protected async showKegStatistics(keg: IKeg): Promise<void> {
		const result = await firstValueFrom(this.sortimentService.getKegUsersStatistics(keg.id));

		this.kegUserStatisticsDialogRef = this.dialogService.open(KegUsersStatisticsDialogComponent, {
			header: `Stav ${keg.name}`,
			width: '90%',
			data: {
				statistics: result,
			},
			dismissableMask: true,
		});
	}

	protected async orderKegs() {
		const eventId = this.eventId;
		if (eventId === null) {
			this.notificationService.error('Nejdřív ulož událost, pak můžeš měnit pořadí sudů');
			return;
		}

		const kegs = this.$eventKegs().map((k, i) => ({ id: k.id, position: i })) ?? [];
		await firstValueFrom(this.sortimentService.updateSortimentBulk(kegs));
	}

	private async setKegActive(keg: IKeg, value: boolean, isEmpty: boolean) {
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
			await firstValueFrom(this.sortimentService.updateSortiment(keg.id, { isActive: value, isEmpty }));
			this.notificationService.success(message);
		}
	}

	private loadEvent(id: number) {
		this.eventService
			.getEvent(id)
			.pipe(
				map((event: IEvent) => {
					event.start = new Date(event.start);
					event.end = new Date(event.end);
					event.kegs = event.kegs.map((k) => +k);

					this.form.patchValue(event);
					this.layoutService.$topBarTitle.set(event.name);

					return event;
				}),
				switchMap((event) => {
					if (event.kegs.length === 0) {
						return of([]);
					}
					return this.sortimentService.getSortimentList(event.kegs);
				}),
				map((kegs) => {
					this.originalKegs = kegs;
					this.$eventKegs.set(kegs);
				}),
			)
			.subscribe();
	}

	public ngOnDestroy() {
		this.kegStatusDialogRef?.close();
		this.kegUserStatisticsDialogRef?.close();
	}

	private initDefaultFormValues() {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setDate(start.getDate() + 7);
		end.setHours(0, 0, 0, 0);

		this.form.patchValue({
			name: `Klubovna ${start.getDate()}.${start.getMonth()} - ${end.getDate()}.${end.getMonth()}`,
			start: start,
			end: end,
		});
	}
}
