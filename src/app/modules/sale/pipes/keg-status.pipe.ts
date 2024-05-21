import { inject, Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IKegStatus } from '../../admin/components/sortiment/types/IKegStatus';
import { SortimentService } from '../../admin/services/sortiment/sortiment.service';

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
