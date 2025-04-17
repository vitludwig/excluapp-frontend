import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { JsonPipe } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { IUser } from '../../types/IUser';
import { orderUsernames } from '../../utils/OrderUsernames';

// TODO: refactor, maybe create separate component for multiple user select
@Component({
	selector: 'app-select-user',
	standalone: true,
	imports: [ButtonModule, DropdownModule, InputTextModule, ListboxModule, PaginatorModule, SharedModule, JsonPipe],
	templateUrl: './select-user.component.html',
	styleUrls: ['./select-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserComponent {
	public $layout = input<'list' | 'form'>('form', { alias: 'layout' });
	public $users = input.required<IUser[], IUser[]>({ transform: orderUsernames, alias: 'users' });

	public select = output<IUser>();

	protected selectedUser: IUser | null = null;

	public reset() {
		this.selectedUser = null;
	}

	protected submit() {
		if (this.selectedUser) {
			this.select.emit(this.selectedUser);
		}
	}
}
