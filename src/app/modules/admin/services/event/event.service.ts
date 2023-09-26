import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IEvent } from '../../types/IEvent';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';
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
				switchMap((events) => forkJoin(events.map((e) => this.appendsKegsToEvent(e)))),
				tap((events) => {
					console.log('events', events);
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

	public appendsKegsToEvent(event: IEvent): Observable<IEvent> {
		return this.http.get<{ eventId: number; kegId: number }[]>(`${environment.apiUrl}/events/${event.id}/kegs`).pipe(
			map((result) => ({
				...event,
				kegs: result.map((obj) => obj.kegId),
			})),
		);
	}

	public addEvent(value: IEvent): Observable<IEvent> {
		return this.http.post<IEvent>(environment.apiUrl + '/events', value);
	}

	public getEvent(id: number): Observable<IEvent> {
		return this.http.get<IEvent>(environment.apiUrl + '/events/' + id).pipe(switchMap((event) => this.appendsKegsToEvent(event)));
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
