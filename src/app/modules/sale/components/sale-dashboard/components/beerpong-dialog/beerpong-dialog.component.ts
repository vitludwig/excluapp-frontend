import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { IUser } from '@modules/user/types/IUser';
import { orderUsernames } from '@modules/user/utils/OrderUsernames';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListboxModule } from 'primeng/listbox';
import { IBeerpong } from '../../../../types/IBeerpong';

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

	protected $kegs = signal<IKeg[]>([]);
	protected $users = signal<IUser[]>([]);
	/**
	 * {<kegId>: IUserRead[]}
	 * @protected
	 */
	protected $data = signal<Record<number, IUser[]>>({});

	public ngOnInit() {
		this.$kegs.set(this.dialogConfig.data.kegs);
		this.$users.set(orderUsernames(this.dialogConfig.data.users));
	}

	protected submit() {
		const usersCount = Object.values(this.$data()).flat().length;
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

	protected onUserSelect(value: IUser[], kegId: number): void {
		if (!this.$data()[kegId]) {
			this.$data()[kegId] = [];
		}

		this.removeDuplicateUsers(value, kegId, this.$data());

		this.$data.update((data) => {
			data[kegId] = value;
			return data;
		});
	}

	private removeDuplicateUsers(newUsers: IUser[], kegId: number, data: Record<number, IUser[]>): void {
		const userIds = newUsers.map((e) => e.id);
		for (const [index, users] of Object.entries(this.$data())) {
			if (index === kegId.toString()) {
				continue;
			}
			if (users.some((e) => userIds.includes(e.id))) {
				data[Number(index)] = data[Number(index)].filter((e) => !userIds.includes(e.id));
			}
		}
	}

	private confirmBeerpong(): void {
		const data: IBeerpong[] = [];
		for (const [keg, users] of Object.entries(this.$data())) {
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
