export interface IUser {
	id: number;
	name: string;
	isRegular: boolean;
	masterUsedId: number | null;
	faceDescriptor: string | null;
}
