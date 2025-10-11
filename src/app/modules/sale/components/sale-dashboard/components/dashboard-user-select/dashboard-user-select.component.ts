import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SelectUserComponent } from '@modules/user/components/select-user/select-user.component';
import { IUser } from '@modules/user/types/IUser';
import { CardModule } from 'primeng/card';

@Component({
	selector: 'app-dashboard-user-select',
	standalone: true,
	imports: [CardModule, SelectUserComponent],
	templateUrl: './dashboard-user-select.component.html',
	styleUrls: ['./dashboard-user-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUserSelectComponent {
	public $users = input.required<IUser[]>({ alias: 'users' });

	public selected = output<IUser>();

	protected selectUser(value: IUser): void {
		this.selected.emit(value);
	}
}
