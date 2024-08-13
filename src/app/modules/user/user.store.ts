import { computed, inject } from '@angular/core';
import { EventStore } from '@modules/event/event.store';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, of, pipe } from 'rxjs';
import { UserService } from './services/user/user.service';
import { IUser } from './types/IUser';

type UserState = {
	users: IUser[];
};

const initialState: UserState = {
	users: [],
};

export const UserStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed((store, eventStore = inject(EventStore), userService = inject(UserService)) => ({
		usersInEvent: computed(() => {
			const eventId = eventStore.activeEvent();

			if (eventId) {
				return userService.getUsersForEvent(eventId.id);
			}
			return of([]);
		}),
	})),
	withMethods((store, userService = inject(UserService), eventStore = inject(EventStore)) => ({
		loadAll: rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return userService.getUsers().pipe(
						tapResponse({
							next: (users) => patchState(store, (state) => ({ users: users })),
							error: console.error,
						}),
					);
				}),
			),
		),
	})),
	withHooks({
		onInit(store) {
			store.loadAll();
		},
	}),
);
