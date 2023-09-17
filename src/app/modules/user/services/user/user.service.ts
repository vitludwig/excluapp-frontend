import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { IUserCreate, IUserRead } from '../../types/IUser';
import { IEvent } from '../../../admin/types/IEvent';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly http = inject(HttpClient);

	public $users = signal<IUserRead[]>([]);

	constructor() {
		this.loadUsers();
	}

	public loadUsers(): void {
		this.http
			.get<IUserRead[]>(environment.apiUrl + '/user')
			.pipe(
				tap((events) => {
					this.$users.set(events);
				}),
			)
			.subscribe();
	}

	public addUser(value: IUserCreate): Observable<IUserRead> {
		return this.http.post<IEvent>(environment.apiUrl + '/user', value);
	}

	public removeUser(id: number): Observable<void> {
		return this.http.delete<void>(environment.apiUrl + '/user/' + id);
	}

	public getUser(id: number): Observable<IUserRead> {
		return this.http.get<IEvent>(environment.apiUrl + '/user/' + id);
	}

	public updateUser(id: number, value: IUserRead): Observable<IUserRead> {
		return this.http.put<IEvent>(environment.apiUrl + '/users' + id, value);
	}
}
