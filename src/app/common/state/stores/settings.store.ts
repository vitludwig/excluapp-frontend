import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";

type SettingsState = {
	enableMultipleDevices: boolean;
	activeEventKegsToShow: number[]; // manually set what kegs are shown in active event, combined with enableMultipleDevices
};

const initialState: SettingsState = {
	enableMultipleDevices: false,
	activeEventKegsToShow: [],
};

export const SettingsStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withMethods((store) => ({
		toggleEnabledMultipleDevices: () => {
			patchState(store, { enableMultipleDevices: !store.enableMultipleDevices() });
			localStorage.setItem('enableMultipleDevices', JSON.stringify(store.enableMultipleDevices()));
		},
		setActiveEventKegsToShow: (ids: number[]) => {
			patchState(store, { activeEventKegsToShow: ids });
			localStorage.setItem('activeEventKegsToShow', JSON.stringify(ids));
		},
		resetActiveEventKegs: () => {
			patchState(store, { activeEventKegsToShow: [] });
			localStorage.removeItem("activeEventKegsToShow");
		}
	})),
	withHooks({
		onInit: (store) => {
			store.setActiveEventKegsToShow(JSON.parse(localStorage.getItem('activeEventKegsToShow') ?? '[]'));

			const enableMultipleDevices = JSON.parse(localStorage.getItem('enableMultipleDevices') ?? 'false');
			patchState(store, { enableMultipleDevices })

		},
	}),
);
