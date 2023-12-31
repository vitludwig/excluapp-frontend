import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IKegUserStatistics } from '../../../../../admin/components/sortiment/types/IKegUserStatistics';
import { UserByIdPipe } from '../../../../../user/pipes/user-by-id.pipe';

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

	protected statistics: IKegUserStatistics[] = [];

	public ngOnInit() {
		this.statistics = this.dialogConfig.data.statistics.sort((a: IKegUserStatistics, b: IKegUserStatistics) => b.volume - a.volume);
	}
}
