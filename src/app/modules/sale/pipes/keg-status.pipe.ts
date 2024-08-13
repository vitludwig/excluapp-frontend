import { inject, Pipe, PipeTransform } from '@angular/core';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { IKegStatus } from '@modules/sortiment/types/IKegStatus';
import { map, Observable } from 'rxjs';

@Pipe({
	name: 'kegStatus',
	standalone: true,
})
export class KegStatusPipe implements PipeTransform {
	private readonly sortimentService = inject(SortimentService);

	transform(kegId: number): Observable<IKegStatus> {
		return this.sortimentService.getKegStatus(kegId).pipe(
			map((status) => {
				status.consumedVolume *= 2; // liters to ks
				status.totalVolume *= 2;

				return status;
			}),
		);
	}
}
