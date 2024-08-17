export interface IKeg {
	id: number;
	name: string;
	sourceName: string;
	volume: number;
	price: number;
	isEmpty: boolean;
	isActive: boolean;
	isCashed: boolean;
	isDefective: boolean;
	isOriginal: boolean;
	position: number;
	eventId: number | null;
}