import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { IUserRead } from '../../../../user/types/IUser';
import { UserService } from '../../../../user/services/user/user.service';
import { CheckboxModule } from 'primeng/checkbox';
import { UserFaceScanDescriptorComponent } from '../../../../user/components/user-face-scan-descriptor/user-face-scan-descriptor.component';
import { FaceRecognitionService } from '../../../../user/services/face-recognition/face-recognition.service';
@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [ButtonModule, CalendarModule, InputTextModule, PaginatorModule, ReactiveFormsModule, CheckboxModule, UserFaceScanDescriptorComponent],
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
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

		await firstValueFrom(request);
		this.router.navigate(['/admin/users']);
	}

	private async loadUser(id: number): Promise<void> {
		this.user = await firstValueFrom(this.userService.getUser(id));
		this.form.patchValue(this.user);
	}
}
