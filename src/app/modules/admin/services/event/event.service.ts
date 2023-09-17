import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IEvent } from '../../types/IEvent';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUserRead } from '../../../user/types/IUser';

@Injectable({
	providedIn: 'root',
})
export class EventService {
	private readonly http = inject(HttpClient);

	public $events = signal<IEvent[]>([]);
	public $activeEvent = signal<IEvent | null>(null);

	constructor() {
		this.loadEvents();
	}

	public loadEvents(): void {
		this.http
			.get<IEvent[]>(environment.apiUrl + '/events')
			.pipe(
				tap((events) => {
					events.forEach((e) => (e.kegs = e.kegs.map((k) => +k))); // TODO: do this on higher level, so everywhere kegs are numbers
					this.$events.set(events);

					const activeEventId = JSON.parse(localStorage.getItem('activeEvent') ?? '');
					if (activeEventId) {
						const event = events.find((e) => e.id === activeEventId) ?? null;
						console.log('found saved event', event);
						this.$activeEvent.set(event);
					}
				}),
			)
			.subscribe();
	}

	public setActiveEvent(event: IEvent | null): void {
		this.$activeEvent.set(event);

		if (event) {
			localStorage.setItem('activeEvent', JSON.stringify(event.id));
		}
	}

	public addEvent(value: IEvent): Observable<IEvent> {
		return this.http.post<IEvent>(environment.apiUrl + '/events', value);
	}

	public getEvent(id: number): Observable<IEvent> {
		return this.http.get<IEvent>(environment.apiUrl + '/events/' + id);
	}

	public updateEvent(id: number, value: IEvent): Observable<IEvent> {
		return this.http.put<IEvent>(environment.apiUrl + '/events/' + id, value);
	}

	public getUsersForEvent(eventId: number): Observable<IUserRead[]> {
		return this.http.get<IUserRead[]>(environment.apiUrl + '/attendance/getUsersByEventId/' + eventId);
	}

	public attendEvent(userId: number, eventId: number): Observable<IUserRead[]> {
		return this.http.post<IUserRead[]>(environment.apiUrl + '/attendance', { userId, eventId });
	}
}
