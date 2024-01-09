import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { IUserRead } from '../types/IUser';

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
