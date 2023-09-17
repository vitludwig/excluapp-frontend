import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { SharedModule } from 'primeng/api';
import { IUserRead } from '../../types/IUser';

@Component({
	selector: 'app-select-user',
	standalone: true,
	imports: [CommonModule, ButtonModule, DropdownModule, InputTextModule, ListboxModule, PaginatorModule, SharedModule],
	templateUrl: './select-user.component.html',
	styleUrls: ['./select-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserComponent {
	@Input()
	public layout: 'list' | 'form' = 'form';

	@Input()
	public multiple: boolean = true;

	@Input()
	public users: IUserRead[] = [];

	@Output()
	public select: EventEmitter<{ newUser: string | null; existingUser: IUserRead[] | null }> = new EventEmitter();

	protected selectedUser: IUserRead[] | IUserRead | null = null;

	protected newUser: string | null = null;

	protected submit() {
		this.select.emit({
			newUser: this.newUser,
			existingUser: this.selectedUser as IUserRead[],
		});
	}

	protected onUserSelect(user: IUserRead) {
		if (!this.multiple) {
			if (this.selectedUser && !Array.isArray(this.selectedUser)) {
				this.selectedUser = [this.selectedUser];
			}
			this.submit();
		}
	}
}
