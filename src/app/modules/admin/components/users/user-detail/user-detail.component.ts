import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { Observable, firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../../../common/services/notification.service';
import { UserFaceScanDescriptorComponent } from '../../../../user/components/user-face-scan-descriptor/user-face-scan-descriptor.component';
import { FaceRecognitionService } from '../../../../user/services/face-recognition/face-recognition.service';
import { UserService } from '../../../../user/services/user/user.service';
import { IUserRead } from '../../../../user/types/IUser';

@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [ButtonModule, CalendarModule, InputTextModule, PaginatorModule, ReactiveFormsModule, UserFaceScanDescriptorComponent, InputSwitchModule],
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly notificationService: NotificationService = inject(NotificationService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);

	protected userId: number | null = null;
	protected user: IUserRead | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		isRegular: new FormControl(false),
	});

	constructor() {
		this.userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

		if (this.userId) {
			this.loadUser(this.userId);
		}
	}

	protected async onSubmit(): Promise<void> {
		let request: Observable<IUserRead>;
		if (this.userId) {
			request = this.userService.updateUser(this.userId, this.form.value as IUserRead);
		} else {
			request = this.userService.addUser(this.form.value as IUserRead);
		}

		try {
			await firstValueFrom(request);
			this.router.navigate(['/admin/users']);
		} catch (e) {
			console.log(e);
			if (e instanceof HttpErrorResponse && e.status === 409) {
				this.notificationService.error('Uživatel s tímto jménem již existuje');
				return;
			}

			throw e;
		}
	}

	private async loadUser(id: number): Promise<void> {
		this.user = await firstValueFrom(this.userService.getUser(id));
		this.form.patchValue(this.user);
	}
}
