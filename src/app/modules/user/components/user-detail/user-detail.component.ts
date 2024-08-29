import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@common/services/notification.service';
import { UserFaceScanDescriptorComponent } from '@modules/user/components/user-face-scan-descriptor/user-face-scan-descriptor.component';
import { FaceRecognitionService } from '@modules/user/services/face-recognition/face-recognition.service';
import { UserService } from '@modules/user/services/user/user.service';
import { isIUser, IUser } from '@modules/user/types/IUser';
import { UserStore } from '@modules/user/user.store';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { catchError, firstValueFrom, Observable, tap } from 'rxjs';

@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [ButtonModule, CalendarModule, InputTextModule, PaginatorModule, ReactiveFormsModule, UserFaceScanDescriptorComponent, InputSwitchModule],
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
	private userStore = inject(UserStore);

	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly notificationService: NotificationService = inject(NotificationService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);

	protected $userId = signal<number | null>(null);
	protected $user = signal<IUser | null>(null);

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		isRegular: new FormControl(false),
	});

	constructor() {
		this.$userId.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
		const userId = this.$userId();
		if (userId) {
			this.loadUser(userId);
		}
	}

	protected async onSubmit(): Promise<void> {
		if (!this.form.value.name) {
			this.notificationService.error('Musíš vyplnit uživatelské jméno');
			return;
		}

		if (!isIUser(this.form.value)) {
			this.notificationService.error('Chyba formuláře, kontaktuj administrátora');
			console.error('User create error: Object is not IUser');
			return;
		}

		let request: Observable<IUser>;
		const userId = this.$userId();

		if (userId) {
			request = this.userStore.update(userId, this.form.value);
		} else {
			request = this.userStore.add({
				name: this.form.value.name,
				isRegular: this.form.value.isRegular,
			});
		}

		request
			.pipe(
				tap(() => this.router.navigate(['/admin/users'])),
				catchError((e) => {
					console.error('User update/create error: ', e);
					if (e instanceof HttpErrorResponse && e.status === 409) {
						this.notificationService.error('Uživatel s tímto jménem již existuje');
						return e;
					}

					return e;
				}),
			)
			.subscribe();
	}

	private async loadUser(id: number): Promise<void> {
		this.$user.set(await firstValueFrom(this.userService.getUserById(id)));
		const user = this.$user();
		if (user) {
			this.form.patchValue(user);
		}
	}
}
