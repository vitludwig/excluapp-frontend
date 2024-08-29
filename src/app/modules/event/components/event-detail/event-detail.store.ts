import { computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { withRouteParams } from '@common/state/features/route-params.feature';
import { EventStore } from '@modules/event/event.store';
import { IEvent } from '@modules/event/types/IEvent';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, map, of, pipe, switchMap, tap } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout/layout.service';

type EventDetailState = {
	eventForm: FormGroup;
	initialEventKegs: IKeg[]; // kegs, that were initialy in event on load, used to compute removed/added kegs
	eventKegs: IKeg[]; // kegs actually in event (including added/removed by user) to be saved
	originalKegs: IKeg[]; // keg templates (isOriginal: true) = new full kegs to add from template
	existingKegs: IKeg[]; // keg templates (isOriginal: false, isEmpty: false) = kegs from previous events
};

const initialState: EventDetailState = {
	eventForm: new FormGroup({
		name: new FormControl('', Validators.required),
		start: new FormControl<Date | null>(null, Validators.required),
		end: new FormControl<Date | null>(null, Validators.required),
		capacity: new FormControl<number>(20, Validators.required),
	}),
	initialEventKegs: [],
	eventKegs: [],
	originalKegs: [],
	existingKegs: [],
};

export const EventDetailStore = signalStore(
	withState<EventDetailState>(initialState),
	withRouteParams({ eventId: (param) => Number(param) }),
	withComputed((store, eventStore = inject(EventStore)) => ({
		event: computed(() => {
			if (store.eventId()) {
				return eventStore.getById(store.eventId());
			}
			return null;
		}),
	})),
	withMethods((store, layoutService = inject(LayoutService), sortimentService = inject(SortimentService), eventStore = inject(EventStore)) => ({
		loadForm: (event: IEvent | null) => {
			if (event) {
				event.start = new Date(event.start);
				event.end = new Date(event.end);
				event.kegs = event.kegs.map((k) => +k);

				store.eventForm().patchValue(event);
				layoutService.$topBarTitle.set(event.name);
			} else {
				store.eventForm().patchValue(getFormDefaultValues());
			}
		},
		loadEventKegs: rxMethod<number[]>(
			pipe(
				exhaustMap((eventKegs) => {
					if (eventKegs.length === 0) {
						return of();
					}

					return sortimentService.getSortimentList(eventKegs).pipe(
						tapResponse({
							next: (kegs) => patchState(store, { eventKegs: kegs, initialEventKegs: kegs }),
							error: console.error,
						}),
					);
				}),
			),
		),
		loadOriginalKegs: rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return sortimentService.getSortimentList(undefined, { isOriginal: true }).pipe(
						tapResponse({
							next: (originalKegs) => patchState(store, { originalKegs: originalKegs }),
							error: console.error,
						}),
					);
				}),
			),
		),
		loadExistingKegs: rxMethod<number[]>(
			pipe(
				exhaustMap((eventKegs) => {
					return sortimentService.getSortimentList(undefined, { isEmpty: false, isOriginal: false }).pipe(
						tapResponse({
							next: (kegs) => patchState(store, { existingKegs: kegs.filter((k) => !eventKegs.includes(k.id)) }),
							error: console.error,
						}),
					);
				}),
			),
		),
		addKeg: (keg: IKeg) => {
			keg.isActive = true;
			patchState(store, { eventKegs: [...store.eventKegs(), keg] });
		},
		removeKeg: (id: number) => {
			return patchState(store, { eventKegs: store.eventKegs().filter((k) => k.id !== id) });
		},
		setKegActive: (id: number, isActive: boolean, isEmpty: boolean) => {
			return sortimentService.updateSortiment(id, { isActive, isEmpty }).pipe(
				tap((keg) => patchState(store, { eventKegs: store.eventKegs().map((k) => (k.id === id ? keg : k)) })),
				catchError((e) => {
					console.error('Error while updating keg.isActive', e);
					throw e;
				}),
			);
		},
		processForm: () => {
			const kegsToAdd: IKeg[] = store.eventKegs().filter(
				(k) =>
					!store
						.initialEventKegs()
						.map((o) => o.id)
						.includes(k.id),
			);
			const existingKegsToAdd = kegsToAdd.filter((keg) => !keg.isOriginal);
			const newKegToAdd = kegsToAdd.filter((keg) => keg.isOriginal).map((keg) => ({ ...keg, isEmpty: false, isOriginal: false }));

			const eventKegIds = store.eventKegs().map((k) => k.id);
			const kegsToRemove = store.initialEventKegs().filter((k) => !eventKegIds.includes(k.id));

			const event = store.event();
			const eventRequest = event ? eventStore.update(event.id, store.eventForm().value) : eventStore.add(store.eventForm().value);

			return eventRequest.pipe(
				switchMap((event) => {
					return addNewSortiment(newKegToAdd, event, sortimentService);
				}),
				switchMap((obj) => {
					// add kegs (new and existing) to event
					const kegsToAdd = [...obj.newSortiment.map((k) => k.id), ...existingKegsToAdd.map((k) => k.id)];
					if (kegsToAdd.length === 0) {
						return of({ event: obj.event });
					}

					return sortimentService.addKegToEvent(obj.event.id, kegsToAdd).pipe(
						tap(() => patchState(store, { eventKegs: [...store.eventKegs(), ...obj.newSortiment] })),
						map(() => ({ event: obj.event })),
					);
				}),
				switchMap((obj) => {
					// remove kegs from event
					if (kegsToRemove.length === 0) {
						return of({ event: obj.event });
					}

					return sortimentService
						.removeKegFromEvent(
							obj.event.id,
							kegsToRemove.map((k) => k.id),
						)
						.pipe(tap(() => patchState(store, { eventKegs: store.eventKegs().filter((eventKeg) => !kegsToRemove.map((k) => k.id).includes(eventKeg.id)) })));
				}),
				tap(() => eventStore.loadAll()),
				catchError((e) => {
					console.error('Event detail form processing error: ', e);
					throw e;
				}),
			);
		},
	})),
	withHooks((store) => ({
		onInit: () => {
			store.loadEventKegs(store.event()?.kegs ?? []);
			store.loadOriginalKegs();
			store.loadExistingKegs(store.event()?.kegs ?? []);
			store.loadForm(store.event());
		},
	})),
);

function getFormDefaultValues() {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date();
	end.setDate(start.getDate() + 7);
	end.setHours(0, 0, 0, 0);

	return {
		name: `Klubovna ${start.getDate()}.${start.getMonth() + 1} - ${end.getDate()}.${end.getMonth() + 1}`,
		start: start,
		end: end,
	};
}

function addNewSortiment(newKegsToAdd: IKeg[], event: IEvent, sortimentService: SortimentService) {
	if (newKegsToAdd.length === 0) {
		return of({ event, newSortiment: [] });
	}

	return sortimentService.addSortiment(newKegsToAdd).pipe(
		map((obj) => ({
			event,
			newSortiment: obj as IKeg[],
		})),
	);
}
