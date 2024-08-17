import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';

import { SelectUserComponent } from '@modules/user/components/select-user/select-user.component';
import { UserFaceRecognitionComponent } from '@modules/user/components/user-face-recognition/user-face-recognition.component';
import { IUser } from '@modules/user/types/IUser';
import { CardModule } from 'primeng/card';

@Component({
	selector: 'app-dashboard-user-select',
	standalone: true,
	imports: [CardModule, SelectUserComponent, UserFaceRecognitionComponent],
	templateUrl: './dashboard-user-select.component.html',
	styleUrls: ['./dashboard-user-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUserSelectComponent {
	public $users = input.required<IUser[]>({ alias: 'users' });

	@Output()
	public selected: EventEmitter<IUser> = new EventEmitter<IUser>();

	protected selectUser(value: IUser): void {
		this.selected.emit(value);
	}
}
