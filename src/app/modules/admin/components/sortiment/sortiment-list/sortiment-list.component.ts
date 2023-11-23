import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { switchMap, tap } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { LoginDialogComponent } from '../../../../../layout/components/sidebar/components/login-dialog/login-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KegStatusDialogComponent } from '../components/keg-status-dialog/keg-status-dialog.component';
import { IsIncludedPipe } from '../../../../../common/pipes/is-included.pipe';

@Component({
	selector: 'app-sortiment-list',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		InputTextModule,
		SharedModule,
		TableModule,
		RouterLink,
		InputSwitchModule,
		FormsModule,
		SelectButtonModule,
		TooltipModule,
		ConfirmComponent,
		IsIncludedPipe,
	],
	templateUrl: './sortiment-list.component.html',
	styleUrls: ['./sortiment-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DialogService],
})
export class SortimentListComponent implements OnInit, OnDestroy {
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly dialogService: DialogService = inject(DialogService);

	protected $kegs = computed(() => {
		let result = this.sortimentService.$allSortiment();

		if (this.$filter().includes('inEvent')) {
			result = result.filter((k) => k.event);
		}
		if (this.$filter().includes('empty')) {
			result = result.filter((k) => k.isEmpty);
		} else {
			result = result.filter((k) => !k.isEmpty);
		}

		return result;
	});

	protected filterOptions: { name: string; value: string; styleClass: string }[] = [
		{ name: 'Prázdné', value: 'empty', styleClass: 'p-button-info' },
		{ name: 'Na párty', value: 'inEvent', styleClass: 'p-button-info' },
	];

	protected $filter = signal<string[]>([]);

	private kegStatusDialogRef: DynamicDialogRef | undefined;

	public ngOnInit(): void {
		this.sortimentService.loadSortiment().subscribe();
	}

	protected clearSearch(table: Table) {
		table.clear();
	}

	protected removeKeg(id: string) {
		this.sortimentService
			.removeSortiment(id)
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected setKegEmptyStatus(id: number, isEmpty: boolean) {
		this.sortimentService
			.updateSortiment(id, { isEmpty })
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected setKegDefectiveStatus(id: number, isDefective: boolean) {
		this.sortimentService
			.updateSortiment(id, { isDefective })
			.pipe(switchMap(() => this.sortimentService.loadSortiment()))
			.subscribe();
	}

	protected toggleFilter(filter: string) {
		this.$filter.update((filters) => {
			if (filters.includes(filter)) {
				return filters.filter((f) => f !== filter);
			} else {
				return [...filters, filter];
			}
		});
	}

	protected showKegStatusDialog(kegId: number) {
		this.kegStatusDialogRef = this.dialogService.open(KegStatusDialogComponent, {
			header: 'Vypito ze sudu',
			width: '400px',
			data: {
				kegId,
			},
		});
	}

	public ngOnDestroy() {
		this.kegStatusDialogRef?.close();
	}
}
