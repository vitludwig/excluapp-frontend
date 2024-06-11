import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { capitalizeEachFirstLetter } from '../../../../common/utils/StringUtils';
import { IKegStatus } from '../../components/sortiment/types/IKegStatus';
import { IKegUserStatistics } from '../../components/sortiment/types/IKegUserStatistics';
import { IEvent } from '../../types/IEvent';
import { IKeg } from '../../types/IKeg';
import { ISortimentFilters } from './types/ISortimentFilters';

@Injectable({
	providedIn: 'root',
})
export class SortimentService {
	private readonly http = inject(HttpClient);

	public $allSortiment = signal<IKeg[]>([]);
	/**
	 * Keg templates, that are copied to events as new kegs
	 */
	public $originalSortiment = computed(() => {
		return this.$allSortiment().filter((obj) => obj.isOriginal);
	});
	/**
	 * Copied kegs from original kegs
	 * When adding new keg to event, original keg is copied and inserted as new (copied) keg
	 */
	public $copySortiment = computed(() => {
		return this.$allSortiment().filter((obj) => !obj.isOriginal);
	});

	/**
	 * Capitalized and trimmed unique keg's source names
	 */
	public $sources = signal<string[]>([]);

	public loadSortiment(): Observable<IKeg[]> {
		return this.http.get<IKeg[]>(`${environment.apiUrl}/keg`).pipe(
			switchMap((kegs) => {
				// if kegs are empty, return empty array - otherwise it will throw empty observable error
				if (kegs.length === 0) {
					return of([]);
				}
				return of(kegs ?? []);
				// return forkJoin(kegs.map((k) => this.getKegEvent(k.id).pipe(map((event) => ({ ...k, event })))));
			}),
			map((value) => {
				this.$allSortiment.set(value);
				this.$sources.set([...new Set(value.map((obj) => capitalizeEachFirstLetter(obj.sourceName.toLowerCase().trim())))]);

				return value;
			}),
		);
	}

	public addSortiment(value: IKeg): Observable<IKeg> {
		return this.http.post<IKeg>(`${environment.apiUrl}/keg`, value);
	}

	public getSortimentById(id: number): Observable<IKeg> {
		return this.http.get<IKeg>(`${environment.apiUrl}/keg/${id}`);
	}

	public getSortimentList(id?: number[], filters?: ISortimentFilters): Observable<IKeg[]> {
		let params = new HttpParams({
			fromObject: {
				ids: id ?? [],
			},
		});
		for (const [paramKey, paramValue] of Object.entries(filters ?? {})) {
			if (paramValue !== undefined) {
				params = params.append(paramKey, paramValue);
			}
		}

		// TODO: sort it on places where its needed, this should only retrieve data
		return this.http.get<IKeg[]>(`${environment.apiUrl}/keg`, { params: params }).pipe(map((kegs) => kegs.sort((a, b) => a.position - b.position)));
	}

	public updateSortiment(id: number, value: Partial<IKeg>): Observable<IKeg> {
		return this.http.patch<IKeg>(`${environment.apiUrl}/keg/${id}`, value).pipe(
			tap((updatedKeg: IKeg) => {
				// this.$allSortiment.update((kegs) => kegs.map((k) => (k.id === updatedKeg.id ? updatedKeg : k)));
			}),
		);
	}

	public updateSortimentBulk(value: Partial<IKeg>[]): Observable<IKeg[]> {
		return this.http.patch<IKeg[]>(`${environment.apiUrl}/keg/`, value).pipe(
			tap((updatedKeg: IKeg[]) => {
				// this.$allSortiment.update((kegs) => kegs.map((k) => updatedKeg.find((uk) => uk.id === k.id) ?? k));
			}),
		);
	}

	public removeSortiment(id: number): Observable<any> {
		return this.http.delete<IKeg>(`${environment.apiUrl}/keg/${id}`);
	}

	public addKegToEvent(eventId: number, kegId: number): Observable<void> {
		return this.http.post<void>(`${environment.apiUrl}/keg/kegToEvent`, {
			eventId: eventId,
			kegId: kegId,
		});
	}

	public getKegEvent(kegId: number): Observable<IEvent> {
		return this.http.get<IEvent>(`${environment.apiUrl}'/keg/${kegId}/event`);
	}

	public removeKegFromEvent(eventId: number, kegId: number): Observable<void> {
		return this.http.delete<void>(`${environment.apiUrl}/keg/kegToEvent/${eventId}/${kegId}`);
	}

	public getKegStatus(kegId: number): Observable<IKegStatus> {
		return this.http.get<IKegStatus>(`${environment.apiUrl}/keg/${kegId}/status`);
	}

	public getKegUsersStatistics(kegId: number): Observable<IKegUserStatistics[]> {
		return this.http.get<IKegUserStatistics[]>(`${environment.apiUrl}/keg/${kegId}/users-statistics`);
	}

	public getDuplicateKegs(keg: IKeg): IKeg[] {
		// TODO: implement
		return [];
		// return this.$originalSortiment().filter(
		// 	(k) => k.sourceName.toLowerCase().trim() === keg.sourceName.toLowerCase().trim() && k.name.toLowerCase().trim() === keg.name.toLowerCase().trim() && k.volume === keg.volume,
		// );
	}
}
