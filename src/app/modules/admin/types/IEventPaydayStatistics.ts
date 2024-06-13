export interface IEventPaydayStatistics {
	userId: number;
	name: string;
	finalPrice: number;
	amount: number;
}

export interface IEventPayday {
	payday: IEventPaydayStatistics[];
	allAddedCosts: number;
}
