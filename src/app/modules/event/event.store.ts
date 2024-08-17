import { inject } from '@angular/core';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';

type EventState = {
	events: IEvent[];
	activeEvent: IEvent | null;
};

const initialState: EventState = {
	events: [],
	activeEvent: null,
};

export const EventStore = signalStore(
	{ providedIn: 'root' },
	withState<EventState>(initialState),
	withComputed((store) => ({})),
	withMethods((store, eventService = inject(EventService)) => {
		function setActiveEvent(id: number): void {
			patchState(store, { activeEvent: store.events().find((e) => e.id === id) ?? null });
			localStorage.setItem('activeEvent', id.toString());
		}

		function getById(id: number): IEvent | null {
			return store.events().find((e) => e.id === id) ?? null;
		}

		function add(event: IEvent) {
			return eventService.addEvent(event).pipe(
				tapResponse({
					next: (event) => {
						patchState(store, { events: [...store.events(), event] });
					},
					error: console.error,
				}),
			);
		}

		function update(id: number, event: IEvent) {
			return eventService.updateEvent(id, event).pipe(
				tapResponse({
					next: (event) => {
						patchState(store, { events: store.events().map((e) => (e.id === id ? event : e)) });
					},
					error: console.error,
				}),
			);
		}

		function remove(id: number) {
			return eventService.removeEvent(id).pipe(
				tapResponse({
					next: (event) => {
						patchState(store, { events: store.events().filter((e) => e.id !== id) });
					},
					error: console.error,
				}),
			);
		}

		const loadAll = rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return eventService.getEvents().pipe(
						tapResponse({
							next: (events) => {
								patchState(store, { events });

								const activeEventId = getActiveEventId();
								if (activeEventId) {
									setActiveEvent(activeEventId);
								}
							},
							error: console.error,
						}),
					);
				}),
			),
		);

		return { setActiveEvent, loadAll, getById, add, remove, update };
	}),
	withHooks({
		onInit(store) {
			store.loadAll();
		},
	}),
);

function getActiveEventId(): number | null {
	const id = localStorage.getItem('activeEvent');
	if (id !== null) {
		return Number(id);
	}
	return null;
}
