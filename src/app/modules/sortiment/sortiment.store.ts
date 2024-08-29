import { computed, inject } from '@angular/core';
import { SettingsStore } from '@common/state/stores/settings.store';
import { EventStore } from '@modules/event/event.store';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { ISortimentFilters } from '@modules/sortiment/services/sortiment/types/ISortimentFilters';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, map, of, pipe } from 'rxjs';

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
	withMethods((store, sortimentService = inject(SortimentService)) => ({
		getAll: rxMethod<ISortimentFilters>(
			pipe(
				exhaustMap((filters = { isEmpty: false, isActive: true }) => {
					return sortimentService.getSortimentList(undefined, filters).pipe(
						tapResponse({
							next: (sortiment) => patchState(store, { sortiment }),
							error: (e) => {
								console.error('Error while all sortiment');
								throw e;
							},
						}),
					);
				}),
			),
		),
		removeKeg: (id: number) => {
			return sortimentService.removeSortiment(id).pipe(
				tapResponse({
					next: () => {
						patchState(store, { sortiment: store.sortiment().filter((k) => k.id !== id) });
					},
					error: (e) => {
						console.error('Error while removing keg from global store');
						throw e;
					},
				}),
			);
		},
		updateKeg: (id: number, property: keyof IKeg, value: any) => {
			return sortimentService.updateSortiment(id, { [property]: value }).pipe(
				tapResponse({
					next: (updatedKeg) =>
						patchState(store, {
							sortiment: store.sortiment().map((k) => (k.id === id ? updatedKeg : k)),
						}),
					error: (e) => {
						console.error('Error while updating keg in global store');
						throw e;
					},
				}),
			);
		},
	})),
);
