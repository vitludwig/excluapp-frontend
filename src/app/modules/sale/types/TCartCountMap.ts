import { EBeerVolume } from '@modules/sale/types/EBeerVolume';

export type TCartCountMap = Record<EBeerVolume | 'beerpong', Record<string, number>>;
