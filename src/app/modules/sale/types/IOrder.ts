import { IKeg } from '../../admin/types/IKeg';

export interface IOrderCreate {
	userId: number;
	kegId: number;
	eventId: number;
}

export interface IOrderRead extends IOrderCreate {
	id: number;
	sortiment?: IKeg;
}

export interface IOrderReadGroup extends IOrderRead {
	count: number;
	orderIds: number[];
}
