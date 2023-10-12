import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	public $isLogged = signal(localStorage.getItem('isLogged') === 'true');

	public login(password: string): boolean {
		const isCorrect = password === '4242';
		if (isCorrect) {
			this.$isLogged.set(true);
		}
		localStorage.setItem('isLogged', isCorrect.toString());
		return isCorrect;
	}

	public logout(): void {
		this.$isLogged.set(false);
		localStorage.setItem('isLogged', 'false');
	}
}
