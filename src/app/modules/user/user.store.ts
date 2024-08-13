import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { UserService } from './services/user/user.service';
import { IUser } from './types/IUser';

export const UserStore = signalStore(
	withEntities<IUser>(),
	withMethods((store, userService = inject(UserService)) => ({
		loadAll: rxMethod<void>(
			pipe(
				exhaustMap(() => {
					return userService.getUsers().pipe(
						tapResponse({
							next: (users) => patchState(store, setAllEntities(users)),
							error: console.error,
						}),
					);
				}),
			),
		),
	})),
);
