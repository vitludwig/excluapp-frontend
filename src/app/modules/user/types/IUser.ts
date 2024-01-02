export interface IUserRead {
	id: number;
	name: string;
	isRegular: boolean;
	masterUsedId: number | null;
	faceDescriptor: string | null;
}

export interface IUserCreate {
	name: string;
}
