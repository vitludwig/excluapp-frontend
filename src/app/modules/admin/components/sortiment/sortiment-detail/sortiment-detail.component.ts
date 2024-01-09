import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { firstValueFrom, switchMap, tap } from 'rxjs';
import { ConfirmComponent } from '../../../../../common/components/confirm/confirm.component';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { IKeg } from '../../../types/IKeg';

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

	protected sortimentId: string | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		sourceName: new FormControl('', Validators.required),
		volume: new FormControl<number>(30, Validators.required),
		price: new FormControl<number | null>(null, Validators.required),
		isCashed: new FormControl<boolean>(false, Validators.required),
	});

	protected $sources = signal(this.sortimentService.$sources());

	constructor() {
		this.sortimentId = this.activatedRoute.snapshot.paramMap.get('id');

		if (this.sortimentId) {
			this.loadSortiment(Number(this.sortimentId));
		}
	}

	protected async onSubmit() {
		try {
			if (this.sortimentId) {
				await firstValueFrom(this.sortimentService.updateSortiment(Number(this.sortimentId), this.form.value as IKeg).pipe(switchMap(() => this.sortimentService.loadSortiment())));
				this.router.navigate(['/admin/sortiment']);
			} else {
				const keg = this.form.value as IKeg; // TODO: add typeguard?
				const duplicateKegs = this.sortimentService.getDuplicateKegs(keg);

				if (duplicateKegs.length > 0) {
					this.confirmationService.confirm({
						message: duplicateKegs.map((obj) => `${obj.name} (${obj.sourceName}, ${obj.volume}l)`).join(', ') + ' je již v databázi. Chceš ho přidat?',
						header: 'Duplikátní sud',
						acceptLabel: 'Ano',
						rejectLabel: 'Ne',
						acceptButtonStyleClass: 'p-button-success',
						rejectButtonStyleClass: 'p-button-danger',
						accept: () => {
							this.addOriginalKeg(keg);
							this.router.navigate(['/admin/sortiment']);
						},
					});
				} else {
					await this.addOriginalKeg(keg);
					this.router.navigate(['/admin/sortiment']);
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	protected searchSources(event: AutoCompleteCompleteEvent): void {
		const result = this.sortimentService.$sources().filter((source) => source.toLowerCase().trim().startsWith(event.query.toLowerCase().trim()));
		this.$sources.set(result);
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

	private addOriginalKeg(keg: IKeg): Promise<IKeg> {
		keg.isOriginal = true;
		return firstValueFrom(this.sortimentService.addSortiment(keg));
	}

	private loadSortiment(id: number) {
		this.sortimentService
			.getSortiment(id)
			.pipe(
				tap((value) => {
					this.form.patchValue(value);
				}),
			)
			.subscribe();
	}
}
