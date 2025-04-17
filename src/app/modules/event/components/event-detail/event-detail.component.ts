import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { NotificationService } from '@common/services/notification.service';
import { EventDetailStore } from '@modules/event/components/event-detail/event-detail.store';
import { KegStatusDialogComponent } from '@modules/sortiment/components/keg-status-dialog/keg-status-dialog.component';
import { KegUsersStatisticsDialogComponent } from '@modules/sortiment/components/keg-users-statistics-dialog/keg-users-statistics-dialog.component';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OrderListModule } from 'primeng/orderlist';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { EventSortimentComponent } from './components/event-sortiment/event-sortiment.component';
import { SortimentStore } from "@modules/sortiment/sortiment.store";

@Component({
	selector: 'app-event-detail',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		InputTextModule,
		CalendarModule,
		TableModule,
		RouterLink,
		EventSortimentComponent,
		TooltipModule,
		ConfirmDialogModule,
		ConfirmComponent,
		JsonPipe,
		DividerModule,
		OrderListModule,
		AsyncPipe,
	],
	providers: [ConfirmationService, DialogService, EventDetailStore],
	templateUrl: './event-detail.component.html',
	styleUrls: ['./event-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent implements OnDestroy {
	protected readonly eventDetailStore = inject(EventDetailStore);
	private readonly sortimentStore = inject(SortimentStore);

	private readonly notificationService = inject(NotificationService);
	private readonly dialogService: DialogService = inject(DialogService);
	private readonly router = inject(Router);
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);

	private kegStatusDialogRef: DynamicDialogRef | undefined;
	private kegUserStatisticsDialogRef: DynamicDialogRef | undefined;

	constructor() {}

	protected async onSubmit() {
		this.eventDetailStore
			.processForm()
			.pipe(
				tap(() => this.router.navigate(['/admin/events'])),
				catchError((e) => {
					this.notificationService.error('Chyba při zpracování formuláře');
					return e;
				}),
			)
			.subscribe();
	}

	protected openToggleConfirm(keg: IKeg) {
		if (keg.isActive) {
			// we are deactivating keg, so we ask if it is empty
			this.confirmationService.confirm({
				header: 'Je sud prázdný?',
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				accept: () => {
					this.setKegActive(keg.id, !keg.isActive, true);
				},
				reject: () => {
					this.setKegActive(keg.id, !keg.isActive, false);
				},
			});
		} else {
			this.setKegActive(keg.id, !keg.isActive, false);
		}
	}

	private setKegActive(id: number, isActive: boolean, isEmpty: boolean) {
		this.eventDetailStore.setKegActive(id, isActive, isEmpty).subscribe({
			next: (keg) => this.notificationService.success(`${keg.name} ${isActive ? 'aktivován' : 'deaktivován'}`),
			error: () => this.notificationService.error(`Nepodařilo se upravit sud`),
		});
	}

	protected showKegStatusDialog(kegId: number) {
		this.kegStatusDialogRef = this.dialogService.open(KegStatusDialogComponent, {
			header: 'Vypito ze sudu',
			width: '400px',
			data: {
				kegId,
			},
			dismissableMask: true,
		});
	}

	protected async showKegStatistics(keg: IKeg): Promise<void> {
		const result = await firstValueFrom(this.sortimentService.getKegUsersStatistics(keg.id));

		this.kegUserStatisticsDialogRef = this.dialogService.open(KegUsersStatisticsDialogComponent, {
			header: `Stav ${keg.name}`,
			width: '90%',
			data: {
				statistics: result,
			},
			dismissableMask: true,
		});
	}

	protected setKegDefectiveStatus(id: number, isDefective: boolean) {
		this.sortimentStore.updateKeg(id, 'isDefective', isDefective).subscribe({
			next: () => {
				this.notificationService.success('Sud upraven');
				this.eventDetailStore.updateKeg(id, { isDefective });
			},
			error: () => this.notificationService.error('Nepodařilo se upravit sud'),
		});
	}

	protected async orderKegs() {
		const eventId = this.eventDetailStore.event()?.id;
		if (eventId === null) {
			this.notificationService.error('Nejdřív ulož událost, pak můžeš měnit pořadí sudů');
			return;
		}

		const kegs = this.eventDetailStore.eventKegs().map((k, i) => ({ id: k.id, position: i })) ?? [];
		await firstValueFrom(this.sortimentService.updateSortimentBulk(kegs));
	}

	public ngOnDestroy() {
		this.kegStatusDialogRef?.close();
		this.kegUserStatisticsDialogRef?.close();
	}
}
