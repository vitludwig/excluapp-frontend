export interface IEventKegsStatistics {
	kegId: number;
	volume: number; // in litres
	kegName: string;
	kegSourceName: string;
	kegVolume: number;
}

export interface IEventUsersStatistics {
	order_userId: number;
	volume: number; // in litres
	userName: string;
	price: number;
}
