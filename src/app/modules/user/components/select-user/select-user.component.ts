import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { UserService } from '../../services/user/user.service';
import { IUserRead } from '../../types/IUser';
import { orderUsernames } from '../../utils/OrderUsernames';

// TODO: refactor, return only true response, multiple select, submit button - CLEANUP
@Component({
	selector: 'app-select-user',
	standalone: true,
	imports: [ButtonModule, DropdownModule, InputTextModule, ListboxModule, PaginatorModule, SharedModule],
	templateUrl: './select-user.component.html',
	styleUrls: ['./select-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserComponent {
	private readonly usersService = inject(UserService);

	@Input()
	public layout: 'list' | 'form' = 'form';

	@Input()
	public multiple: boolean = true;

	@Input({ transform: orderUsernames })
	public users: IUserRead[] = this.usersService.$users();

	@Output()
	public select: EventEmitter<IUserRead[] | null> = new EventEmitter();

	protected selectedUser: IUserRead[] | null = null;

	protected submit() {
		if (!this.multiple) {
			if (this.selectedUser && !Array.isArray(this.selectedUser)) {
				this.selectedUser = [this.selectedUser];
			}
		}
		console.log('selecting', this.selectedUser);
		this.select.emit(this.selectedUser);
	}
}
