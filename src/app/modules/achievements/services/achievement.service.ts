import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IAchievement } from '@modules/achievements/types/IAchievement';

@Injectable({
	providedIn: 'root',
})
export class AchievementService {
	private readonly http = inject(HttpClient);

	public getAchievements() {
		return this.http.get<IAchievement[]>('/api/achievements');
	}

	public getAchievementById(id: number) {
		return this.http.get<IAchievement>(`/api/achievements/${id}`);
	}

	public removeAchievement(id: number) {
		return this.http.delete<void>(`/api/achievements/${id}`);
	}

	public addAchievement(achievement: IAchievement) {
		return this.http.post<IAchievement>('/api/achievements', achievement);
	}

	public updateAchievement(id: number, achievement: Partial<IAchievement>) {
		return this.http.patch<IAchievement>(`/api/achievements/${id}`, achievement);
	}
}
