import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IKegUserStatistics } from '@modules/sortiment/types/IKegUserStatistics';
import { UserByIdPipe } from '@modules/user/pipes/user-by-id.pipe';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
	selector: 'app-keg-users-statistics-dialog',
	standalone: true,
	imports: [DividerModule, UserByIdPipe],
	templateUrl: './keg-users-statistics-dialog.component.html',
	styleUrl: './keg-users-statistics-dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KegUsersStatisticsDialogComponent {
	public readonly dialogRef = inject(DynamicDialogRef);
	public readonly dialogConfig = inject(DynamicDialogConfig<IKegUserStatistics[]>);

	protected $statistics = signal<IKegUserStatistics[]>([]);

	public ngOnInit() {
		this.$statistics.set(this.dialogConfig.data.statistics.sort((a: IKegUserStatistics, b: IKegUserStatistics) => b.volume - a.volume));
	}
}
