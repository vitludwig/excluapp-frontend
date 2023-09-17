import { inject, Injectable, signal } from '@angular/core';
import { IEvent } from '../../../admin/types/IEvent';
import { EventService } from '../../../admin/services/event/event.service';
import { IOrderCreate, IOrderRead } from '../../types/IOrder';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private readonly eventService = inject(EventService);
	private readonly http = inject(HttpClient);

	public $activeEvent = signal<IEvent | null>(null);

	constructor() {
		const activeEventId = localStorage.getItem('activeEvent');
		if (activeEventId) {
			this.$activeEvent.set(this.eventService.$events().find((e) => e.id === +activeEventId) ?? null);
		}
	}

	public addOrder(value: IOrderCreate): Observable<IOrderRead> {
		return this.http.post<IOrderRead>(environment.apiUrl + '/order', value);
	}

	public removeOrder(id: number): Observable<IOrderRead> {
		return this.http.delete<IOrderRead>(environment.apiUrl + '/order/' + id);
	}

	public getOrderByEventUserId(eventId: number, userId: number): Observable<IOrderRead[]> {
		if (!eventId || !userId) {
			throw Error('Summary loading error: User or event not filled!');
		}
		return this.http.get<IOrderRead[]>(`${environment.apiUrl}/order/event-user/${eventId}/${userId}`);
	}
}
