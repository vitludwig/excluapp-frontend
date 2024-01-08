import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class LayoutService {
	public $sidebarVisible = signal(false);
	public $topBarTitle = signal('');
}
