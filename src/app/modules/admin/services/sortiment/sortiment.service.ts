import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { filter, firstValueFrom, map, Observable, tap } from 'rxjs';
import { IKeg } from '../../types/IKeg';
import { IEvent } from '../../types/IEvent';

@Injectable({
	providedIn: 'root',
})
export class SortimentService {
	private readonly http = inject(HttpClient);

	public $allSortiment = signal<IKeg[]>([]);
	public $originalSortiment = signal<IKeg[]>([]);
	public $copySortiment = signal<IKeg[]>([]);

	public loadSortiment(): Observable<IKeg[]> {
		return this.http.get<IKeg[]>(environment.apiUrl + '/keg').pipe(
			tap(async (value) => {
				// TODO: predelat reaktivne, fuj!
				for (const keg of value) {
					keg.event = await firstValueFrom(this.getKegEvent(keg.id));
				}
				console.log('kegs', value);
				this.$allSortiment.set(value);
				this.$originalSortiment.set(value.filter((obj) => obj.isOriginal));
				this.$copySortiment.set(value.filter((obj) => !obj.isOriginal));

				return value;
			}),
		);
	}

	public addSortiment(value: IKeg): Observable<IKeg> {
		return this.http.post<IKeg>(environment.apiUrl + '/keg', value);
	}

	public getSortiment(id: string): Observable<IKeg> {
		return this.http.get<IKeg>(environment.apiUrl + '/keg/' + id);
	}

	public updateSortiment(id: string, value: IKeg): Observable<IKeg> {
		return this.http.put<IKeg>(environment.apiUrl + '/keg/' + id, value);
	}

	public removeSortiment(id: string): Observable<IKeg> {
		return this.http.delete<IKeg>(environment.apiUrl + '/keg/' + id);
	}

	public addKegToEvent(eventId: number, kegId: number): Observable<void> {
		return this.http.post<void>(environment.apiUrl + '/keg/kegToEvent', {
			eventId: eventId,
			kegId: kegId,
		});
	}

	public getKegEvent(kegId: number): Observable<IEvent> {
		return this.http.get<IEvent>(environment.apiUrl + '/keg/' + kegId + '/event');
	}

	public removeKegFromEvent(eventId: number, kegId: number): Observable<void> {
		return this.http.delete<void>(`${environment.apiUrl}/keg/kegToEvent/${eventId}/${kegId}`);
	}
}
