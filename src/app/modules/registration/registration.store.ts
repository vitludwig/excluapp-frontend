import { computed, inject } from '@angular/core';
import { withRouteParams } from '@common/state/features/route-params.feature';
import { EventStore } from '@modules/event/event.store';
import { EventService } from '@modules/event/services/event/event.service';
import { UserService } from '@modules/user/services/user/user.service';
import { IUser } from '@modules/user/types/IUser';
import { UserStore } from '@modules/user/user.store';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { of } from 'rxjs';

type RegistrationState = {
	eventUsers: IUser[];
};

const initialState: RegistrationState = {
	eventUsers: [],
};

export const RegistrationStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withRouteParams({ routeEventId: (param) => parseRouteId(param) }),
	withComputed((store, eventStore = inject(EventStore)) => ({
		eventId: computed(() => {
			const fromRoute = store.routeEventId(); // This is from withRouteParams
			return fromRoute !== undefined ? fromRoute : eventStore.activeEvent()?.id ?? undefined;
		}),
	})),
	withComputed((store, eventStore = inject(EventStore), userStore = inject(UserStore)) => ({
		event: computed(() => {
			const eventId = store.eventId();
			if (eventId) {
				return eventStore.getById(eventId);
			}
			return null;
		}),
		usersToPick: computed(() => {
			return userStore.users().filter((user) => !store.eventUsers().find((u) => u.id === user.id));
		}),
	})),
	withMethods((store, userService = inject(UserService), eventService = inject(EventService), userStore = inject(UserStore)) => ({
		addUser: (userId: number) => {
			const eventId = store.eventId();
			if (!eventId) {
				console.error('No event id loaded');
				return of();
			}

			return eventService.attendEvent(userId, eventId).pipe(
				tapResponse({
					next: (users) => {
						patchState(store, () => ({ eventUsers: users }));
						userStore.updateUsersInEvent(users);
					},
					error: (e) => {
						console.error('Error while attending user to event', e);
						throw e;
					},
				}),
			);
		},
		removeUser: (userId: number) => {
			const eventId = store.eventId();
			if (!eventId) {
				console.error('No event id loaded');
				return of();
			}

			return eventService.unAttendEvent(userId, eventId).pipe(
				tapResponse({
					next: () => {
						patchState(store, (state) => ({ eventUsers: state.eventUsers.filter((obj) => obj.id !== userId) }));
						userStore.loadUsersInEvent(eventId);
					},
					error: (e) => {
						console.error('Error while unattending user from event', e);
						throw e;
					},
				}),
			);
		},
		loadUsers: () => {
			const eventId = store.eventId();
			if (!eventId) {
				console.error('No event id loaded');
				return of();
			}

			return userService.getUsersForEvent(eventId).pipe(
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

function parseRouteId(param: string | undefined): number | undefined {
	if (param === undefined) {
		return undefined;
	}
	const num = parseInt(param, 10);
	return isNaN(num) ? undefined : num;
}
