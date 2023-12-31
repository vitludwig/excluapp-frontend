import { IUserRead } from '../types/IUser';

/**
 * First put Regular users, then put the rest in alphabetical order
 * @param value
 */
export function orderUsernames(value: IUserRead[]): IUserRead[] {
	return value.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => (a.isRegular ? -1 : 1));
}
