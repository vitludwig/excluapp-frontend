import { IUser, IUserCreate } from '@modules/user/types/IUser';

export class User {
	public static create(value: IUserCreate): IUser {
		return {
			id: 0,
			name: value.name,
			isRegular: value.isRegular,
			masterUsedId: null,
			faceDescriptor: null,
		};
	}
}
