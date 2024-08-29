import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { IUser } from '../../types/IUser';
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

	protected $layout = signal<'list' | 'form'>('form');
	protected $users = signal<IUser[]>([]);

	public ngOnInit() {
		this.$users.set(this.dialogConfig.data.users);
		this.$layout.set(this.dialogConfig.data.layout ?? 'form');
	}

	protected submit(value: IUser | null) {
		this.dialogRef.close(value);
	}
}
