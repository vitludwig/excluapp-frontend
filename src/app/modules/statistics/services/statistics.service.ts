import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IEventKegsStatistics, IUsersStatistics } from "@modules/event/types/IEventKegsStatistics";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

	private readonly http = inject(HttpClient);

	public getKegsStatistics(eventId: number): Observable<IEventKegsStatistics[]> {
		return this.http.get<IEventKegsStatistics[]>(`${environment.apiUrl}/statistics/event/${eventId}/keg-statistics`);
	}

	public getUsersStatistics(eventId: number): Observable<IUsersStatistics[]> {
		return this.http.get<IUsersStatistics[]>(`${environment.apiUrl}/statistics/event/${eventId}/user-statistics/`);
	}

	public getAllUsersStatistics(from?: string, to?: string): Observable<IUsersStatistics[]> {
		let params = new HttpParams();
		if(from) {
			params = params.append('from', from);
		}
		if(to) {
			params = params.append('to', to);
		}
		return this.http.get<IUsersStatistics[]>(`${environment.apiUrl}/statistics/users-all/`, {
			params: params
		});
	}
}
