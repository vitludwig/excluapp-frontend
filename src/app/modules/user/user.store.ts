import { effect, inject } from '@angular/core';
import { NotificationService } from '@common/services/notification.service';
import { EventStore } from '@modules/event/event.store';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, of, pipe, switchMap } from 'rxjs';
import { UserService } from './services/user/user.service';
import { IUser, IUserCreate } from './types/IUser';
import { HttpErrorResponse } from '@angular/common/http';

type UserState = {
	users: IUser[];
	usersInEvent: IUser[];
};

const initialState: UserState = {
	users: [],
	usersInEvent: [],
};

export const UserStore = signalStore(
	{ providedIn: 'root' },
	withState<UserState>(initialState),
	withMethods((store, userService = inject(UserService), notificationService = inject(NotificationService)) => ({
		loadUsersInEvent: rxMethod<number | undefined>(
			pipe(
				switchMap((eventId) => {
					if (!eventId) {
						patchState(store, { usersInEvent: [] });
						return of();
					}
					return userService.getUsersForEvent(eventId).pipe(
						tapResponse({
							next: (users) => patchState(store, { usersInEvent: users }),
							error: (e) => {
								notificationService.error('Nepodařilo se načíst uživatele pro událost');
								console.error(e);
							},
						}),
					);
				}),
			),
		),
		updateUsersInEvent: (users: IUser[]) => {
			patchState(store, { usersInEvent: users });
		},
		loadAll: rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return userService.getUsers().pipe(
						tapResponse({
							next: (users) => patchState(store, () => ({ users: users })),
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
						console.error(e);

						if (e instanceof HttpErrorResponse && e.status === 409) {
							notificationService.error('Uživatel s tímto jménem již existuje');
							return;
						}
						notificationService.error('Nepodařilo se aktualizovat uživatele');

					},
				}),
			);
		},
		add: (userCreate: IUserCreate) => {
			return userService.addUser(userCreate).pipe(
				tapResponse({
					next: (user) => patchState(store, (state) => ({ users: [...state.users, user] })),
					error: (e) => {
						console.error(e);

						if (e instanceof HttpErrorResponse && e.status === 409) {
							notificationService.error('Uživatel s tímto jménem již existuje');
							return;
						}
						notificationService.error('Nepodařilo se přidat uživatele');

					},
				}),
			);
		},
		remove: (userId: number) => {
			return userService.removeUser(userId).pipe(
				tapResponse({
					next: () => patchState(store, (state) => ({ users: state.users.filter((obj) => obj.id !== userId) })),
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
			const eventStore = inject(EventStore);
			store.loadAll();
			effect(() => {
				const eventId = eventStore.activeEvent()?.id;
				store.loadUsersInEvent(eventId);
			});
		},
	}),
);
