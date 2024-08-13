export interface IEvent {
	id: number;
	name: string;
	start: Date;
	end: Date;
	kegs: number[];
	capacity: number;
}
