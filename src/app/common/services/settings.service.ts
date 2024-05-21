import { effect, Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	public $enableMultipleDevices = signal<boolean>(localStorage.getItem('enableMultipleDevices') === 'true');

	constructor() {
		effect(() => {
			localStorage.setItem('enableMultipleDevices', JSON.stringify(this.$enableMultipleDevices()));
		});
	}
}
