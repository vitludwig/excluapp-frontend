import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { tap } from 'rxjs';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { UserService } from '../../../../user/services/user/user.service';

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
