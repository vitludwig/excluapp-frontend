import { inject } from '@angular/core';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
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
	withState(initialState),
	withMethods((store, eventService = inject(EventService)) => {
		function setActiveEvent(id: number): void {
			patchState(store, { activeEvent: store.events().find((e) => e.id === id) ?? null });
		}

		const loadAll = rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return eventService.loadEvents().pipe(
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

		function getById(id: number) {
			return store.events().find((e) => e.id === id) ?? null;
		}
		return { setActiveEvent, loadAll, getById };
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
