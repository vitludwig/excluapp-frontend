import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SelectUserComponent } from '../../../../../user/components/select-user/select-user.component';
import { UserService } from '../../../../../user/services/user/user.service';
import { IUserRead } from '../../../../../user/types/IUser';

@Component({
	selector: 'app-dashboard-user-select',
	standalone: true,
	imports: [CommonModule, CardModule, SelectUserComponent],
	templateUrl: './dashboard-user-select.component.html',
	styleUrls: ['./dashboard-user-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUserSelectComponent {
	protected readonly usersService: UserService = inject(UserService);

	@Output()
	public selected: EventEmitter<IUserRead> = new EventEmitter<IUserRead>();

	protected selectUser(value: IUserRead): void {
		this.selected.emit(value);
	}
}
