import { computed, inject } from '@angular/core';
import { NotificationService } from '@common/services/notification.service';
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
	withMethods((store, userService = inject(UserService), eventService = inject(EventService), notificationService = inject(NotificationService)) => ({
		addUser: (userId: number) => {
			eventService
				.attendEvent(userId, store.eventId())
				.pipe(
					tapResponse({
						next: (users) => patchState(store, (state) => ({ eventUsers: users })),
						error: (e) => {
							notificationService.error('Nepodařilo se registrovat uživatele');
							console.error(e);
						},
					}),
				)
				.subscribe();
		},
		removeUser: (userId: number) => {
			eventService
				.attendEvent(userId, store.eventId())
				.pipe(
					tapResponse({
						next: (users) => patchState(store, (state) => ({ eventUsers: state.eventUsers.filter((obj) => obj.id !== userId) })),
						error: (e) => {
							notificationService.error('Nepodařilo se odregistrovat uživatele');
							console.error(e);
						},
					}),
				)
				.subscribe();
		},
		loadUsers: () => {
			if (!store.eventId()) {
				notificationService.error('Nepodařilo se načíst uživatele');
				console.error('Registration user load error: event not specified');
				return;
			}

			userService
				.getUsersForEvent(store.eventId())
				.pipe(
					tapResponse({
						next: (eventUsers) => patchState(store, { eventUsers }),
						error: (e) => {
							notificationService.error('Nepodařilo se načíst uživatele');
							console.error(e);
						},
					}),
				)
				.subscribe();
		},
	})),
);
