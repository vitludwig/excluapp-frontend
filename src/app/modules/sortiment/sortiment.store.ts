import { computed, inject } from '@angular/core';
import { SettingsStore } from '@common/state/stores/settings.store';
import { EventStore } from '@modules/event/event.store';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { ISortimentFilters } from '@modules/sortiment/services/sortiment/types/ISortimentFilters';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { map, of } from 'rxjs';

type SortimentState = {
	sortiment: IKeg[];
};

const initialState: SortimentState = {
	sortiment: [],
};

export const SortimentStore = signalStore(
	{ providedIn: 'root' },
	withState<SortimentState>(initialState),
	withComputed((store, eventStore = inject(EventStore), settingsStore = inject(SettingsStore), sortimentService = inject(SortimentService)) => {
		const allKegsInActiveEvent = computed(() => {
			let kegIds = eventStore.activeEvent()?.kegs ?? [];

			if (kegIds.length === 0) {
				return of([]);
			}

			return sortimentService.getSortimentList(kegIds, { isEmpty: false, isActive: true });
		});

		const kegsInActiveEvent = computed(() => {
			let kegIds = eventStore.activeEvent()?.kegs ?? [];
			if (settingsStore.enableMultipleDevices()) {
				kegIds = settingsStore.activeEventKegsToShow() ?? [];
			}

			if (kegIds.length === 0) {
				return of([]);
			}

			return allKegsInActiveEvent().pipe(map((kegs) => kegs.filter((k) => kegIds.includes(k.id))));
		});

		return { allKegsInActiveEvent, kegsInActiveEvent };
	}),
	withMethods((store, sortimentService = inject(SortimentService)) => {
		function getAll(filters: ISortimentFilters = { isEmpty: false, isActive: true }) {
			sortimentService.getSortimentList(undefined, filters).pipe(
				tapResponse({
					next: (sortiment) => patchState(store, { sortiment }),
					error: console.error,
				}),
			);
		}

		return { getAll };
	}),
);
