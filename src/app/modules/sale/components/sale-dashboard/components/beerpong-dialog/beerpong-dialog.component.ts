import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IKeg } from '../../../../../admin/types/IKeg';
import { ListboxModule } from 'primeng/listbox';
import { IUserRead } from '../../../../../user/types/IUser';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IBeerpong } from '../../../../types/IBeerpong';

@Component({
	selector: 'app-beerpong-dialog',
	standalone: true,
	imports: [CommonModule, ListboxModule, FormsModule, ButtonModule],
	templateUrl: './beerpong-dialog.component.html',
	styleUrls: ['./beerpong-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeerpongDialogComponent implements OnInit {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig);

	protected kegs: IKeg[] = [];
	protected users: IUserRead[] = [];
	/**
	 * {<kegId>: IUserRead[]}
	 * @protected
	 */
	protected data: Record<number, IUserRead[]> = {};

	public ngOnInit() {
		this.kegs = this.dialogConfig.data.kegs;
		this.users = this.dialogConfig.data.users;
	}

	protected submit() {
		const data: IBeerpong[] = [];
		for (const [keg, users] of Object.entries(this.data)) {
			for (const user of users) {
				data.push({
					kegId: Number(keg),
					userId: user.id,
				});
			}
		}

		this.dialogRef.close(data);
	}
}
