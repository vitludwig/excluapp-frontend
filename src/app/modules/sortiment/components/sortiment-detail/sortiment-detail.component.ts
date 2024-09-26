import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '@common/components/confirm/confirm.component';
import { NotificationService } from '@common/services/notification.service';
import { Keg } from '@modules/sortiment/models/keg.model';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { catchError, firstValueFrom, tap } from "rxjs";
@Component({
	selector: 'app-sortiment-detail',
	standalone: true,
	imports: [ButtonModule, InputTextModule, PaginatorModule, ReactiveFormsModule, ListboxModule, AutoCompleteModule, ConfirmDialogModule, InputSwitchModule, ConfirmComponent],
	templateUrl: './sortiment-detail.component.html',
	styleUrls: ['./sortiment-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ConfirmationService],
})
export class SortimentDetailComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly confirmationService = inject(ConfirmationService);
	private readonly notificationService = inject(NotificationService);

	protected form = new FormGroup({
		name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
		sourceName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
		volume: new FormControl<number>(30, { validators: [Validators.required], nonNullable: true }),
		price: new FormControl<number>(0, { validators: [Validators.required], nonNullable: true }),
		isCashed: new FormControl<boolean>(false, { validators: [Validators.required], nonNullable: true }),
	});

	protected $allSources = signal<string[]>([]);
	protected $searchSources = signal<string[]>([]);
	protected $sortimentId = signal<number | null>(null);

	constructor() {
		this.$sortimentId.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
		const id = this.$sortimentId();
		if (id) {
			this.loadSortiment(id);
		}

		this.loadSources();
	}

	protected async onSubmit() {
		const id = this.$sortimentId();
		if (id) {
			this.updateKeg(id);
		} else {
			this.addNewKeg(Keg.create(this.form.getRawValue()));
		}
	}

	private updateKeg(id: number) {
		this.sortimentService
			.updateSortiment(id, this.form.getRawValue())
			.pipe(tap(() => this.router.navigate(['/admin/sortiment'])))
			.subscribe({
				error: () => this.notificationService.error('Nepodařilo se upravit sud'),
			});
	}

	private async addNewKeg(keg: IKeg) {
		const duplicateKeg = await firstValueFrom(this.sortimentService.getDuplicateKegs(keg))

		if (duplicateKeg.length > 0) {
			this.confirmationService.confirm({
				message: duplicateKeg.map((obj) => `${obj.name} (${obj.sourceName}, ${obj.volume}l, ${obj.price}Kč)`).join(',\n\r ') + ' je již v databázi. Chceš ho přidat?',
				header: 'Duplikátní sud',
				acceptLabel: 'Ano',
				rejectLabel: 'Ne',
				acceptButtonStyleClass: 'p-button-success',
				rejectButtonStyleClass: 'p-button-danger',
				accept: () => {
					this.addOriginalKeg(keg)
						.pipe(tap(() => this.router.navigate(['/admin/sortiment'])))
						.subscribe();
				},
			});
		} else {
			this.addOriginalKeg(keg)
				.pipe(tap(() => this.router.navigate(['/admin/sortiment'])))
				.subscribe();
		}
	}

	protected searchSources(event: AutoCompleteCompleteEvent): void {
		const result = this.$allSources().filter((source) => source.toLowerCase().trim().startsWith(event.query.toLowerCase().trim()));
		this.$searchSources.set(result);
	}

	protected confirmKegIsCashed(event: InputSwitchChangeEvent): void {
		const message = `Opravdu chceš nastavit sud jako ${event.checked ? '' : 'ne'}zaplacený?`;
		this.confirmationService.confirm({
			target: event.originalEvent.target as EventTarget,
			header: 'Potvrdit',
			message: message,
			acceptLabel: 'Ano',
			rejectLabel: 'Ne',
			reject: () => {
				this.form.get('isCashed')?.setValue(!this.form.get('isCashed')?.value);
			},
		});
	}

	private addOriginalKeg(keg: IKeg) {
		keg.isOriginal = true;

		return this.sortimentService.addSortiment(keg).pipe(
			catchError((e) => {
				this.notificationService.error('Nepodařilo se přidat nový plný sud');
				return e;
			}),
		);
	}

	private loadSortiment(id: number) {
		this.sortimentService
			.getSortimentById(id)
			.subscribe({
				next: (value) => this.form.patchValue(value),
				error: () => this.notificationService.error('Nepodařilo se načíst detail sortimentu'),
			});
	}

	private loadSources() {
		this.sortimentService.getSources().subscribe({
			next: (value) => this.$allSources.set(value),
			error: () => this.notificationService.error('Nepodařilo se načíst pivovary'),
		})
	}
}
