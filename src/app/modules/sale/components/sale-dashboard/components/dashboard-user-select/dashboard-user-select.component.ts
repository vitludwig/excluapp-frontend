import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CardModule } from 'primeng/card';
import { SelectUserComponent } from '../../../../../user/components/select-user/select-user.component';
import { IUserRead } from '../../../../../user/types/IUser';

@Component({
	selector: 'app-dashboard-user-select',
	standalone: true,
	imports: [CardModule, SelectUserComponent],
	templateUrl: './dashboard-user-select.component.html',
	styleUrls: ['./dashboard-user-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUserSelectComponent {
	@Input({ required: true })
	public users: IUserRead[] | null = [];

	@Output()
	public selected: EventEmitter<IUserRead> = new EventEmitter<IUserRead>();

	protected selectUser(value: IUserRead): void {
		this.selected.emit(value);
	}
}
