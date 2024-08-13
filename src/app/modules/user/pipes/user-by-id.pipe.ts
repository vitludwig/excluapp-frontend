import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserStore } from '@modules/user/user.store';
import { IUser } from '../types/IUser';

@Pipe({
	name: 'userById',
	standalone: true,
})
export class UserByIdPipe implements PipeTransform {
	protected userStore = inject(UserStore);

	transform(value?: number): IUser | null {
		if (!value) {
			return null;
		}
		return this.userStore.users().find((user) => user.id === value) ?? null;
	}
}
