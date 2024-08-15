export interface IUser {
	id: number;
	name: string;
	isRegular: boolean;
	masterUsedId: number | null;
	faceDescriptor: string | null;
}

export interface IUserCreate extends Pick<IUser, 'name' | 'isRegular'> {}

export function isIUser(value: unknown): value is IUser {
	return typeof value === 'object' && value !== null && 'name' in value && 'isRegular' in value;
}
