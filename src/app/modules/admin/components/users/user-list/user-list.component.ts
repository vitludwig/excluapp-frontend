import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { tap } from 'rxjs';
import { UserService } from '../../../../user/services/user/user.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';

@Component({
	selector: 'app-user-list',
	standalone: true,
	imports: [ButtonModule, SharedModule, TableModule, RouterLink, InputTextModule, ConfirmPopupModule, ConfirmComponent],
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ConfirmationService],
})
export class UserListComponent {
	protected readonly userService: UserService = inject(UserService);

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected removeUser(id: number) {
		this.userService
			.removeUser(id)
			.pipe(tap(() => this.userService.loadUsers()))
			.subscribe();
	}
}
