import { computed, inject } from '@angular/core';
import { ISortimentFilters } from '@modules/sortiment/services/sortiment/types/ISortimentFilters';
import { SortimentStore } from '@modules/sortiment/sortiment.store';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';

type SortimentListState = {
	filters: ISortimentFilters;
};

const initialState: SortimentListState = {
	filters: { isEmpty: false },
};

export const SortimentListStore = signalStore(
	withState<SortimentListState>(initialState),
	withComputed((store, sortimentStore = inject(SortimentStore)) => ({
		originalKegs: computed(() => {
			return sortimentStore.sortiment().filter((k) => k.isOriginal);
		}),
		copyKegs: computed(() => {
			return sortimentStore.sortiment().filter((k) => !k.isOriginal);
		}),
	})),
	withMethods((store, sortimentStore = inject(SortimentStore)) => ({
		toggleFilter: (filterName: keyof ISortimentFilters) => {
			patchState(store, { filters: { ...store.filters(), [filterName]: !store.filters()[filterName] } });
			sortimentStore.getAll(store.filters());
		},
	})),
	withHooks((store, sortimentStore = inject(SortimentStore)) => ({
		onInit: () => {
			sortimentStore.getAll(store.filters());
		},
	})),
);
