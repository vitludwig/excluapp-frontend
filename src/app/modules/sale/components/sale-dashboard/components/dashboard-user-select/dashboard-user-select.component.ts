import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';

import { CardModule } from 'primeng/card';
import { SelectUserComponent } from '../../../../../user/components/select-user/select-user.component';
import { UserFaceRecognitionComponent } from '../../../../../user/components/user-face-recognition/user-face-recognition.component';
import { IUserRead } from '../../../../../user/types/IUser';

@Component({
	selector: 'app-dashboard-user-select',
	standalone: true,
	imports: [CardModule, SelectUserComponent, UserFaceRecognitionComponent],
	templateUrl: './dashboard-user-select.component.html',
	styleUrls: ['./dashboard-user-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUserSelectComponent {
	public $users = input.required<IUserRead[]>({ alias: 'users' });

	@Output()
	public selected: EventEmitter<IUserRead | null> = new EventEmitter<IUserRead | null>();

	protected selectUser(value: IUserRead | null): void {
		this.selected.emit(value);
	}
}
