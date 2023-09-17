import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { tap } from 'rxjs';
import { UserService } from '../../../../user/services/user/user.service';

@Component({
	selector: 'app-user-list',
	standalone: true,
	imports: [CommonModule, ButtonModule, SharedModule, TableModule, RouterLink, InputTextModule],
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
	protected readonly userService: UserService = inject(UserService);

	constructor() {
		this.userService.loadUsers();
	}

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
