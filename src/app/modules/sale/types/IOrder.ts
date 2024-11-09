import { IKeg } from "@modules/sortiment/types/IKeg";

export interface IOrderCreate {
	userId: number;
	kegId: number;
	eventId: number;
	volume: number; // volume in liters
}

export interface IOrderRead extends IOrderCreate {
	id: number;
	keg: IKeg;
}

export interface IOrderReadGroup extends IOrderRead {
	count: number;
	orderIds: number[]; // order ids in which is keg present
}
