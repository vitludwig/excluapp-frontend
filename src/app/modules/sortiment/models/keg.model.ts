import { IKeg, IKegCreate } from '@modules/sortiment/types/IKeg';

export class Keg {
	public static create(value: IKegCreate): IKeg {
		return {
			id: 0,
			name: value.name,
			sourceName: value.sourceName,
			volume: value.volume,
			price: value.price,
			isCashed: value.isCashed,
			isActive: false,
			isDefective: false,
			isEmpty: false,
			isOriginal: true,
			position: 0,
			eventId: null,
		};
	}
}
