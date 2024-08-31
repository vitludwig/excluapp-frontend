import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { NotificationService } from '@common/services/notification.service';
import { AchievementService } from '@modules/achievements/services/achievement.service';
import { Button, ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import {ConfirmPopupModule} from 'primeng/confirmpopup';

@Component({
	selector: 'app-achievement-list',
	standalone: true,
	imports: [Button, TableModule, AsyncPipe, RouterLink, ButtonDirective, ConfirmComponent, ConfirmPopupModule],
	templateUrl: './achievement-list.component.html',
	styleUrl: './achievement-list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementListComponent {
	private readonly achievementService = inject(AchievementService);
	private readonly notificationService = inject(NotificationService);

	protected achievements$ = this.achievementService.getAchievements();

	protected removeAchievement(id: number) {
		this.achievementService.removeAchievement(id).subscribe({
			next: () => this.notificationService.success('Odstraněno'),
			error: () => this.notificationService.error('Nepodařilo se odstranit achievement'),
		});
	}
}
