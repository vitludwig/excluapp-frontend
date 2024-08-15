import { computed, inject } from '@angular/core';
import { NotificationService } from '@common/services/notification.service';
import { EventStore } from '@modules/event/event.store';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, of, pipe } from 'rxjs';
import { UserService } from './services/user/user.service';
import { IUser, IUserCreate } from './types/IUser';

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
	withMethods((store, userService = inject(UserService), eventStore = inject(EventStore), notificationService = inject(NotificationService)) => ({
		loadAll: rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return userService.getUsers().pipe(
						tapResponse({
							next: (users) => patchState(store, (state) => ({ users: users })),
							error: (e) => {
								// TODO create error layer for handling notifications etc.
								notificationService.error('Nepodařilo se načíst uživatele');
								console.error(e);
							},
						}),
					);
				}),
			),
		),
		update: (id: number, value: IUser) => {
			return userService.updateUser(id, value).pipe(
				tapResponse({
					next: (user) => patchState(store, (state) => ({ users: state.users.map((obj) => (obj.id === user.id ? user : obj)) })),
					error: (e) => {
						notificationService.error('Nepodařilo se aktualizovat uživatele');
						console.error(e);
					},
				}),
			);
		},
		add: (userCreate: IUserCreate) => {
			return userService.addUser(userCreate).pipe(
				tapResponse({
					next: (user) => patchState(store, (state) => ({ users: [...state.users, user] })),
					error: (e) => {
						notificationService.error('Nepodařilo se přidat uživatele');
						console.error(e);
					},
				}),
			);
		},
		remove: (userId: number) => {
			return userService.removeUser(userId).pipe(
				tapResponse({
					next: (user) => patchState(store, (state) => ({ users: state.users.filter((obj) => obj.id !== userId) })),
					error: (e) => {
						notificationService.error('Nepodařilo se odstranit uživatele');
						console.error(e);
					},
				}),
			);
		},
	})),
	withHooks({
		onInit(store) {
			store.loadAll();
		},
	}),
);
