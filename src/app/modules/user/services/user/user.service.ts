import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUser, IUserCreate } from '../../types/IUser';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly http = inject(HttpClient);

	public getUsers(): Observable<IUser[]> {
		return this.http.get<IUser[]>(environment.apiUrl + '/user');
	}

	public getUserById(id: number): Observable<IUser> {
		return this.http.get<IUser>(environment.apiUrl + '/user/' + id);
	}

	public getUsersForEvent(eventId: number): Observable<IUser[]> {
		return this.http.get<IUser[]>(environment.apiUrl + '/attendance/getUsersByEventId/' + eventId);
	}

	public addUser(user: IUserCreate): Observable<IUser> {
		return this.http.post<IUser>(environment.apiUrl + '/user', user);
	}

	public removeUser(id: number): Observable<void> {
		return this.http.delete<void>(environment.apiUrl + '/user/' + id);
	}

	public updateUser(id: number, value: Partial<IUser>): Observable<IUser> {
		return this.http.put<IUser>(environment.apiUrl + '/user/' + id, value);
	}
}
