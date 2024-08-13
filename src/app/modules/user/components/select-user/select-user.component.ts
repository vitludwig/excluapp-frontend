import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output } from '@angular/core';

import { JsonPipe } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { UserService } from '../../services/user/user.service';
import { IUser } from '../../types/IUser';
import { orderUsernames } from '../../utils/OrderUsernames';

// TODO: refactor, return only true response, multiple select, submit button - CLEANUP
@Component({
	selector: 'app-select-user',
	standalone: true,
	imports: [ButtonModule, DropdownModule, InputTextModule, ListboxModule, PaginatorModule, SharedModule, JsonPipe],
	templateUrl: './select-user.component.html',
	styleUrls: ['./select-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserComponent {
	private readonly usersService = inject(UserService);

	public $layout = input<'list' | 'form'>('form', { alias: 'layout' });
	public $users = input.required<IUser[], IUser[]>({ transform: orderUsernames, alias: 'users' });

	@Output()
	public select: EventEmitter<IUser | null> = new EventEmitter();

	protected selectedUser: IUser | null = null;

	protected submit() {
		this.select.emit(this.selectedUser);
	}
}
