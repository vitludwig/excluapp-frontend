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

export interface IKegCreate extends Pick<IKeg, 'name' | 'sourceName' | 'volume' | 'price' | 'isCashed'> {}

export function isIKeg(obj: any): obj is IKeg {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'name' in obj &&
		typeof obj.name === 'string' &&
		'sourceName' in obj &&
		typeof obj.sourceName === 'string' &&
		'volume' in obj &&
		typeof obj.volume === 'number' &&
		'price' in obj &&
		typeof obj.price === 'number' &&
		'isEmpty' in obj &&
		typeof obj.isEmpty === 'boolean' &&
		'isActive' in obj &&
		typeof obj.isActive === 'boolean' &&
		'isCashed' in obj &&
		typeof obj.isCashed === 'boolean' &&
		'isDefective' in obj &&
		typeof obj.isDefective === 'boolean' &&
		'isOriginal' in obj &&
		typeof obj.isOriginal === 'boolean' &&
		'position' in obj &&
		typeof obj.position === 'number'
	);
}
