import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@common/services/notification.service';
import { AchievementService } from '@modules/achievements/services/achievement.service';
import { UserFaceScanDescriptorComponent } from '@modules/user/components/user-face-scan-descriptor/user-face-scan-descriptor.component';
import { Button } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { tap } from 'rxjs';

// TODO: create local store
@Component({
	selector: 'app-achievement-detail',
	standalone: true,
	imports: [ReactiveFormsModule, Button, InputSwitchModule, InputTextModule, UserFaceScanDescriptorComponent, InputTextareaModule],
	templateUrl: './achievement-detail.component.html',
	styleUrl: './achievement-detail.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementDetailComponent {
	private readonly activatedRoute = inject(ActivatedRoute);
	private readonly achievementService = inject(AchievementService);
	private readonly notificationService = inject(NotificationService);

	protected $achievementId = signal<number | null>(null);
	protected achievementForm = new FormGroup({
		name: new FormControl('', Validators.required),
		description: new FormControl(''),
		condition: new FormControl({}),
	});

	constructor() {
		this.$achievementId.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
		const id = this.$achievementId();
		if (id) {
			this.loadData(id);
		}
	}

	private loadData(id: number) {
		this.achievementService
			.getAchievementById(id)
			.pipe(
				tap((achievement) => {
					achievement.condition = JSON.stringify(achievement.condition);
					this.achievementForm.patchValue(achievement);
				}),
			)
			.subscribe({
				error: () => this.notificationService.error('Nepodařilo se načíst detail'),
			});
	}

	public onSubmit() {
		const id = this.$achievementId();
		if (id) {
			// @ts-ignore
			this.achievementService.updateAchievement(id, this.achievementForm.value);
		} else {
			// @ts-ignore
			this.achievementService.addAchievement(this.achievementForm.value);
		}
	}
}
