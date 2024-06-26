import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUserRead } from '../../../user/types/IUser';
import { IEvent } from '../../types/IEvent';
import { IEventKegsStatistics, IEventUsersStatistics } from '../../types/IEventKegsStatistics';
import { IEventPayday } from '../../types/IEventPaydayStatistics';

@Injectable({
	providedIn: 'root',
})
export class EventService {
	private readonly http = inject(HttpClient);

	public $events = signal<IEvent[]>([]);
	public $activeEventId = signal<number | null>(null);
	public $activeEvent = computed(() => {
		const activeEventId = this.$activeEventId();
		if (activeEventId === null) {
			this.setActiveEventKegsToShow([]);
			return null;
		}

		const event = this.$events().find((e) => e.id === activeEventId) ?? null;

		return event;
	});

	private activeEventKegsToShowSubject: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
	public activeEventKegsToShow$: Observable<number[]> = this.activeEventKegsToShowSubject.asObservable();

	public setActiveEventKegsToShow(value: number[]) {
		this.activeEventKegsToShowSubject.next(value);
		localStorage.setItem('activeEventKegsToShow', JSON.stringify(value));
	}

	constructor() {
		this.activeEventKegsToShowSubject.next(JSON.parse(localStorage.getItem('activeEventKegsToShow') ?? '[]'));
	}

	public loadEvents(): Observable<IEvent[]> {
		return this.http.get<IEvent[]>(environment.apiUrl + '/events').pipe(
			map((events) => {
				this.$events.set(events);

				const activeEventId = this.getActiveEventId();
				if (activeEventId) {
					const event = events.find((e) => e.id === activeEventId) ?? null;
					this.setActiveEvent(event ?? null);
				}

				return events;
			}),
		);
	}

	public setActiveEvent(event: IEvent | null): void {
		const eventActiveKegs = JSON.parse(localStorage.getItem('activeEventKegsToShow') ?? '[]');

		if ((event && event.id !== this.getActiveEventId()) || eventActiveKegs.length === 0) {
			this.setActiveEventKegsToShow(event?.kegs ?? []);
		}

		this.$activeEventId.set(event?.id ?? null);

		if (event) {
			localStorage.setItem('activeEvent', JSON.stringify(event.id));
		}
	}

	public getActiveEventId(): number | null {
		const id = localStorage.getItem('activeEvent');
		if (id !== null) {
			return Number(id);
		}
		return null;
	}

	public addEvent(value: IEvent): Observable<IEvent> {
		return this.http.post<IEvent>(environment.apiUrl + '/events', value).pipe(
			map((event) => {
				this.$events.update((events) => [...events, event]);
				return event;
			}),
		);
	}

	public getEvent(id: number): Observable<IEvent> {
		return this.http.get<IEvent>(environment.apiUrl + '/events/' + id);
	}

	public updateEvent(id: number, value: IEvent): Observable<IEvent> {
		return this.http.put<IEvent>(environment.apiUrl + '/events/' + id, value).pipe(
			map((event) => {
				this.$events.update((events) => events.map((e) => (e.id === id ? event : e)));
				return event;
			}),
		);
	}

	public removeEvent(id: number): Observable<IEvent> {
		return this.http.delete<IEvent>(environment.apiUrl + '/events/' + id).pipe(
			map((event) => {
				this.$events.update((events) => events.filter((e) => e.id !== id));
				return event;
			}),
		);
	}

	public getUsersForEvent(eventId: number): Observable<IUserRead[]> {
		return this.http.get<IUserRead[]>(environment.apiUrl + '/attendance/getUsersByEventId/' + eventId);
	}

	public attendEvent(userId: number, eventId: number): Observable<IUserRead[]> {
		return this.http.post<IUserRead[]>(environment.apiUrl + '/attendance', { userId, eventId });
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
