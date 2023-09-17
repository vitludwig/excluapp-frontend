import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { IUserRead } from '../../../../user/types/IUser';
import { UserService } from '../../../../user/services/user/user.service';
@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [CommonModule, ButtonModule, CalendarModule, InputTextModule, PaginatorModule, ReactiveFormsModule],
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	protected userId: number | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
	});

	constructor() {
		this.userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

		if (this.userId) {
			this.loadUser(this.userId);
		}
	}

	protected onSubmit() {
		let request;
		if (this.userId) {
			request = this.userService.updateUser(this.userId, this.form.value as IUserRead);
		} else {
			request = this.userService.addUser(this.form.value as IUserRead);
		}

		request
			.pipe(
				tap(() => {
					this.router.navigate(['/admin/users']);
				}),
			)
			.subscribe();
	}

	private loadUser(id: number) {
		this.userService
			.getUser(id)
			.pipe(
				tap((event) => {
					this.form.patchValue(event);
				}),
			)
			.subscribe();
	}
}
