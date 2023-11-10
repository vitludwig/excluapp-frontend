import { IUserRead } from './IUser';

export interface IUserSelectResponse {
	newUser: string | null;
	existingUser: IUserRead[] | null;
}
