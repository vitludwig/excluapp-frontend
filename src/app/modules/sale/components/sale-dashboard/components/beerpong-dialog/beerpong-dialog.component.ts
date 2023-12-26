import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IKeg } from '../../../../../admin/types/IKeg';
import { ListboxModule } from 'primeng/listbox';
import { IUserRead } from '../../../../../user/types/IUser';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IBeerpong } from '../../../../types/IBeerpong';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { JsonPipe } from '@angular/common';

@Component({
	selector: 'app-beerpong-dialog',
	standalone: true,
	imports: [ListboxModule, FormsModule, ButtonModule, ConfirmDialogModule, JsonPipe],
	templateUrl: './beerpong-dialog.component.html',
	styleUrls: ['./beerpong-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ConfirmationService],
})
export class BeerpongDialogComponent implements OnInit {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig);
	private readonly confirmationService = inject(ConfirmationService);

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
		const usersCount = Object.values(this.data).flat().length;
		if (usersCount !== 4) {
			this.confirmationService.confirm({
				message: `Zvolil jsi ${usersCount} hráčů na beerpong, je to správně?`,
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				acceptButtonStyleClass: 'p-button-success',
				rejectButtonStyleClass: 'p-button-danger',
				accept: () => {
					this.confirmBeerpong();
				},
			});
		} else {
			this.confirmBeerpong();
		}
	}

	protected onUserSelect(value: IUserRead[], kegId: number): void {
		if (!this.data[kegId]) {
			this.data[kegId] = [];
		}

		this.data[kegId] = value;

		// const kegs = Object.values(this.data).map((e) => e.length);
		// if (kegs.some((e) => e > 2)) {
		// 	event.preventDefault();
		// }
	}

	private confirmBeerpong(): void {
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
