import { inject, Pipe, PipeTransform } from '@angular/core';
import { IUserRead } from '../types/IUser';
import { UserService } from '../services/user/user.service';

@Pipe({
	name: 'userById',
	standalone: true,
})
export class UserByIdPipe implements PipeTransform {
	private usersService = inject(UserService);

	transform(value?: number): IUserRead | null {
		if (!value) {
			return null;
		}
		return this.usersService.$users().find((user) => user.id === value) ?? null;
	}
}
