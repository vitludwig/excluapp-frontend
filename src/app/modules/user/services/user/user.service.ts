import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUser } from '../../types/IUser';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly http = inject(HttpClient);

	public $users = signal<IUser[]>([]);

	public getUsers(): Observable<IUser[]> {
		return this.http.get<IUser[]>(environment.apiUrl + '/user');
	}

	public getUserById(id: number): Observable<IUser> {
		return this.http.get<IUser>(environment.apiUrl + '/user/' + id);
	}

	public addUser(name: string): Observable<IUser> {
		return this.http.post<IUser>(environment.apiUrl + '/user', { name });
	}

	public removeUser(id: number): Observable<void> {
		return this.http.delete<void>(environment.apiUrl + '/user/' + id);
	}

	public updateUser(id: number, value: Partial<IUser>): Observable<IUser> {
		return this.http.put<IUser>(environment.apiUrl + '/user/' + id, value);
	}
}
