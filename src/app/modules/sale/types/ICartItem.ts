import { EBeerVolume } from '@modules/sale/types/EBeerVolume';

export interface ICartItem {
	userId: number;
	kegId: number;
	volume: EBeerVolume;
	isBeerpong: boolean;
}
