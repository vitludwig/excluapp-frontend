import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { SharedModule } from 'primeng/api';
import { IUserRead } from '../../types/IUser';
import { IUserSelectResponse } from '../../types/IUserSelectResponse';

function orderUsernameAlphabetically(value: IUserRead[]) {
	return value.sort((a, b) => a.name.localeCompare(b.name));
}

@Component({
	selector: 'app-select-user',
	standalone: true,
	imports: [ButtonModule, DropdownModule, InputTextModule, ListboxModule, PaginatorModule, SharedModule],
	templateUrl: './select-user.component.html',
	styleUrls: ['./select-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserComponent {
	@Input()
	public layout: 'list' | 'form' = 'form';

	@Input()
	public multiple: boolean = true;

	@Input({ transform: orderUsernameAlphabetically })
	public users: IUserRead[] = [];

	@Output()
	public select: EventEmitter<IUserSelectResponse> = new EventEmitter();

	protected selectedUser: IUserRead[] | null = null;

	protected newUser: string | null = null;

	protected submit() {
		if (!this.multiple) {
			if (this.selectedUser && !Array.isArray(this.selectedUser)) {
				this.selectedUser = [this.selectedUser];
			}
		}

		this.select.emit({
			newUser: this.newUser,
			existingUser: this.selectedUser as IUserRead[],
		});
	}
}
