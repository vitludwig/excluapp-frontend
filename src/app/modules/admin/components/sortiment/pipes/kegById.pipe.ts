import { inject, Pipe, PipeTransform } from '@angular/core';
import { SortimentService } from '../../../services/sortiment/sortiment.service';
import { IKeg } from '../../../types/IKeg';

@Pipe({
	name: 'kegById',
	standalone: true,
})
export class KegByIdPipe implements PipeTransform {
	private readonly sortimentService = inject(SortimentService);

	transform(value: number): IKeg | null {
		return this.sortimentService.$copySortiment().find((keg) => keg.id === value) ?? null;
	}
}
