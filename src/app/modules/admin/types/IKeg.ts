import { IEvent } from './IEvent';

export interface IKeg {
	id: number;
	name: string;
	sourceName: string;
	volume: number;
	price: number;
	isEmpty: boolean;
	isOriginal: boolean;
	event?: IEvent;
}
