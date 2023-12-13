import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, tap } from 'rxjs';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { IKeg } from '../../../types/IKeg';
import { ListboxModule } from 'primeng/listbox';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';

@Component({
	selector: 'app-sortiment-detail',
	standalone: true,
	imports: [CommonModule, ButtonModule, InputTextModule, PaginatorModule, ReactiveFormsModule, ListboxModule, AutoCompleteModule],
	templateUrl: './sortiment-detail.component.html',
	styleUrls: ['./sortiment-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentDetailComponent {
	protected readonly sortimentService: SortimentService = inject(SortimentService);
	private readonly router: Router = inject(Router);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	protected sortimentId: string | null = null;

	protected form = new FormGroup({
		name: new FormControl('', Validators.required),
		sourceName: new FormControl('', Validators.required),
		volume: new FormControl<number>(30, Validators.required),
		price: new FormControl<number | null>(null, Validators.required),
	});

	protected $sources = signal(this.sortimentService.$sources());

	constructor() {
		this.sortimentId = this.activatedRoute.snapshot.paramMap.get('id');

		if (this.sortimentId) {
			this.loadUser(Number(this.sortimentId));
		}
	}

	protected async onSubmit() {
		try {
			if (this.sortimentId) {
				await firstValueFrom(this.sortimentService.updateSortiment(Number(this.sortimentId), this.form.value as IKeg));
			} else {
				(<IKeg>this.form.value).isOriginal = true;
				await firstValueFrom(this.sortimentService.addSortiment(this.form.value as IKeg));
			}
			this.router.navigate(['/admin/sortiment']);
		} catch (e) {
			console.error(e);
		}
	}

	protected searchSources(event: AutoCompleteCompleteEvent): void {
		const result = this.sortimentService.$sources().filter((source) => source.toLowerCase().trim().startsWith(event.query.toLowerCase().trim()));
		this.$sources.set(result);
	}

	private loadUser(id: number) {
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
