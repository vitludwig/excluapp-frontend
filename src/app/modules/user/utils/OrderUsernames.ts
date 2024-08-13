import { IUser } from '../types/IUser';

/**
 * First put Regular users, then put the rest in alphabetical order
 * @param value
 */
export function orderUsernames(value: IUser[]): IUser[] {
	const regularUsers = value.filter((user) => user.isRegular).sort((a, b) => a.name.localeCompare(b.name));
	const vitecek = regularUsers.splice(
		regularUsers.findIndex((user) => user.name === 'Víteček'),
		1,
	);
	if (vitecek.length > 0) {
		regularUsers.unshift(vitecek[0]);
	}

	const otherUsers = value.filter((user) => !user.isRegular).sort((a, b) => a.name.localeCompare(b.name));
	return [...regularUsers, ...otherUsers];
}
