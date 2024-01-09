import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUserCreate, IUserRead } from '../../types/IUser';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly http = inject(HttpClient);

	public $users = signal<IUserRead[]>([]);

	public async loadUsers(): Promise<void> {
		const result = await firstValueFrom(this.http.get<IUserRead[]>(environment.apiUrl + '/user'));
		this.$users.set(result);
	}

	public addUser(value: IUserCreate): Observable<IUserRead> {
		return this.http.post<IUserRead>(environment.apiUrl + '/user', value);
	}

	public removeUser(id: number): Observable<void> {
		return this.http.delete<void>(environment.apiUrl + '/user/' + id);
	}

	public getUser(id: number): Observable<IUserRead> {
		return this.http.get<IUserRead>(environment.apiUrl + '/user/' + id);
	}

	public updateUser(id: number, value: Partial<IUserRead>): Observable<IUserRead> {
		return this.http.put<IUserRead>(environment.apiUrl + '/user/' + id, value);
	}
}
