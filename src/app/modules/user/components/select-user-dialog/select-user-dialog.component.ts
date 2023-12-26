import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';

import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { IUserRead } from '../../types/IUser';
import { ListboxModule } from 'primeng/listbox';
import { SelectUserComponent } from '../select-user/select-user.component';

@Component({
	selector: 'app-select-user-dialog',
	standalone: true,
	imports: [DropdownModule, FormsModule, InputTextModule, ButtonModule, ListboxModule, SelectUserComponent],
	templateUrl: './select-user-dialog.component.html',
	styleUrls: ['./select-user-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserDialogComponent implements OnInit {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig);

	protected layout: 'list' | 'form' = 'form';
	protected users: IUserRead[] = [];

	public ngOnInit() {
		this.users = this.dialogConfig.data.users;
		this.layout = this.dialogConfig.data.layout ?? 'form';
	}

	protected submit(value: { newUser: string | null; existingUser: IUserRead[] | null }) {
		this.dialogRef.close(value);
	}
}
