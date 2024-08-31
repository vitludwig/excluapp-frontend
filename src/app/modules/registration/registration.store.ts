import { computed, inject } from '@angular/core';
import { withRouteParams } from '@common/state/features/route-params.feature';
import { EventStore } from '@modules/event/event.store';
import { EventService } from '@modules/event/services/event/event.service';
import { UserService } from '@modules/user/services/user/user.service';
import { IUser } from '@modules/user/types/IUser';
import { UserStore } from '@modules/user/user.store';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

type RegistrationState = {
	eventUsers: IUser[];
};

const initialState: RegistrationState = {
	eventUsers: [],
};

export const RegistrationStore = signalStore(
	withState(initialState),
	withRouteParams({ eventId: (param) => Number(param) }),
	withComputed((store, eventStore = inject(EventStore), userStore = inject(UserStore)) => ({
		event: computed(() => {
			if (store.eventId()) {
				return eventStore.getById(store.eventId());
			}
			return null;
		}),
		usersToPick: computed(() => {
			return userStore.users().filter((user) => !store.eventUsers().find((u) => u.id === user.id));
		}),
	})),
	withMethods((store, userService = inject(UserService), eventService = inject(EventService)) => ({
		addUser: (userId: number) => {
			return eventService.attendEvent(userId, store.eventId()).pipe(
				tapResponse({
					next: (users) => patchState(store, (state) => ({ eventUsers: users })),
					error: (e) => {
						console.error('Error while attending user to event', e);
						throw e;
					},
				}),
			);
		},
		removeUser: (userId: number) => {
			return eventService.attendEvent(userId, store.eventId()).pipe(
				tapResponse({
					next: (users) => patchState(store, (state) => ({ eventUsers: state.eventUsers.filter((obj) => obj.id !== userId) })),
					error: (e) => {
						console.error('Error while unattending user from event', e);
						throw e;
					},
				}),
			);
		},
		loadUsers: () => {
			return userService.getUsersForEvent(store.eventId()).pipe(
				tapResponse({
					next: (eventUsers) => patchState(store, { eventUsers }),
					error: (e) => {
						console.error('Error while loading users to registration', e);
						throw e;
					},
				}),
			);
		},
	})),
);
