import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IOrderCreate, IOrderRead } from '../../types/IOrder';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private readonly http = inject(HttpClient);

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

	public getTransactions(userIds?: number[], eventIds?: number[]): Observable<IOrderRead[]> {
		const params = new HttpParams({
			fromObject: {
				eventIds: eventIds ?? [],
				userIds: userIds ?? [],
			},
		});
		return this.http.get<IOrderRead[]>(`${environment.apiUrl}/order/`, { params: params });
	}
}
