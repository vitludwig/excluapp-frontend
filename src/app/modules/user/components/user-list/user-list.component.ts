import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { UserStore } from '@modules/user/user.store';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

@Component({
	selector: 'app-user-list',
	standalone: true,
	imports: [ButtonModule, SharedModule, TableModule, RouterLink, InputTextModule, ConfirmPopupModule, ConfirmComponent, JsonPipe],
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ConfirmationService],
})
export class UserListComponent {
	protected readonly userStore = inject(UserStore);

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected removeUser(id: number) {
		this.userStore.remove(id).subscribe();
	}
}
