import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IEvent } from '@modules/event/types/IEvent';
import { IEventKegsStatistics, IEventUsersStatistics } from '@modules/event/types/IEventKegsStatistics';
import { IEventPayday } from '@modules/event/types/IEventPaydayStatistics';
import { IUser } from '@modules/user/types/IUser';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class EventService {
	private readonly http = inject(HttpClient);

	public addEvent(value: IEvent): Observable<IEvent> {
		return this.http.post<IEvent>(environment.apiUrl + '/events', value);
	}

	public getEvent(id: number): Observable<IEvent> {
		return this.http.get<IEvent>(environment.apiUrl + '/events/' + id);
	}

	public getEvents(): Observable<IEvent[]> {
		return this.http.get<IEvent[]>(environment.apiUrl + '/events');
	}

	public updateEvent(id: number, value: IEvent): Observable<IEvent> {
		return this.http.put<IEvent>(environment.apiUrl + '/events/' + id, value);
	}

	public removeEvent(id: number): Observable<IEvent> {
		return this.http.delete<IEvent>(environment.apiUrl + '/events/' + id);
	}

	public attendEvent(userId: number, eventId: number): Observable<IUser[]> {
		return this.http.post<IUser[]>(environment.apiUrl + '/attendance', { userId, eventId });
	}

	public unAttendEvent(userId: number, eventId: number): Observable<void> {
		return this.http.delete<void>(`${environment.apiUrl}/attendance/${eventId}/${userId}`);
	}

	public getKegsStatistics(eventId: number): Observable<IEventKegsStatistics[]> {
		return this.http.get<IEventKegsStatistics[]>(`${environment.apiUrl}/events/${eventId}/keg-statistics`);
	}

	public getUsersStatistics(eventId: number): Observable<IEventUsersStatistics[]> {
		return this.http.get<IEventUsersStatistics[]>(`${environment.apiUrl}/events/${eventId}/user-statistics/`);
	}

	public getEventPayday(eventIds: number[], onlyUncashed?: boolean): Observable<IEventPayday[]> {
		return this.http.post<IEventPayday[]>(`${environment.apiUrl}/events/payday/`, { onlyUncashed, eventIds });
	}
}
