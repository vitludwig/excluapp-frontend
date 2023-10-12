import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { catchError, combineLatest, filter, firstValueFrom, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { IKeg } from '../../types/IKeg';
import { IEvent } from '../../types/IEvent';

@Injectable({
	providedIn: 'root',
})
export class SortimentService {
	private readonly http = inject(HttpClient);

	public $allSortiment = signal<IKeg[]>([]);
	/**
	 * Keg templates, that are copied to events as new kegs
	 */
	public $originalSortiment = signal<IKeg[]>([]);
	/**
	 * Copied kegs from original kegs
	 * When adding new keg to event, original keg is copied and inserted as new (copied) keg
	 */
	public $copySortiment = signal<IKeg[]>([]);

	public loadSortiment(): Observable<IKeg[]> {
		return this.http.get<IKeg[]>(environment.apiUrl + '/keg').pipe(
			switchMap((kegs) => {
				// if kegs are empty, return empty array - otherwise it will throw empty observable error
				if (kegs.length === 0) {
					return of([]);
				}
				return forkJoin(kegs.map((k) => this.getKegEvent(k.id).pipe(map((event) => ({ ...k, event })))));
			}),
			map((value) => {
				this.$allSortiment.set(value);
				this.$originalSortiment.set(value.filter((obj) => obj.isOriginal));
				this.$copySortiment.set(value.filter((obj) => !obj.isOriginal));
				console.log('all sortiment', this.$allSortiment());
				return value;
			}),
		);
	}

	public addSortiment(value: IKeg): Observable<IKeg> {
		return this.http.post<IKeg>(environment.apiUrl + '/keg', value);
	}

	public getSortiment(id: number): Observable<IKeg> {
		return this.http.get<IKeg>(environment.apiUrl + '/keg/' + id);
	}

	public updateSortiment(id: number, value: Partial<IKeg>): Observable<IKeg> {
		return this.http.patch<IKeg>(environment.apiUrl + '/keg/' + id, value);
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
