import { computed } from '@angular/core';
import { EBeerVolume } from '@modules/sale/types/EBeerVolume';
import { ICartItem } from '@modules/sale/types/ICartItem';
import { TCartCountMap } from '@modules/sale/types/TCartCountMap';
import { IUser } from '@modules/user/types/IUser';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

type OrderState = {
	cart: ICartItem[];
	orderProcessing: boolean;
	selectedUser: IUser | null;
};

const initialState: OrderState = {
	cart: [],
	orderProcessing: false,
	selectedUser: null,
};

export const OrderStore = signalStore(
	withState<OrderState>(initialState),
	withComputed((store) => ({
		cartCountMap: computed(() => {
			const result: TCartCountMap = {
				[EBeerVolume.BIG]: {},
				[EBeerVolume.SMALL]: {},
				beerpong: {},
			};

			for (const item of store.cart()) {
				const category = item.isBeerpong ? 'beerpong' : item.volume === EBeerVolume.BIG ? EBeerVolume.BIG : EBeerVolume.SMALL;
				if (!result[category][item.kegId]) {
					result[category][item.kegId] = 1;
				} else {
					result[category][item.kegId]++;
				}
			}
			return result;
		}),
	})),
	withMethods((store) => ({
		setOrderProcessing: (value: boolean) => {
			patchState(store, { orderProcessing: value });
		},
		resetOrder: () => {
			patchState(store, { cart: [] });
			patchState(store, { selectedUser: null });
		},
		clearCart: () => {
			patchState(store, { cart: [] });
		},
		addOneToCart: (item: ICartItem) => {
			patchState(store, { cart: [...store.cart(), item] });
		},
		removeOneFromCart: (id: number, volume: number) => {
			// remove only first occurrence, because there might be multiple duplicate items
			let cart = store.cart();
			const index = cart.findIndex((obj) => obj.kegId === id && obj.volume === volume);

			if (index !== -1) {
				cart.splice(index, 1);
			}

			patchState(store, { cart: [...cart] });
		},
		setSelectedUser: (user: IUser) => {
			patchState(store, { selectedUser: user });
		},
	})),
);
