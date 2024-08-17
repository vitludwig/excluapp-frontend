import { Pipe, PipeTransform } from '@angular/core';
import { IKeg } from '@modules/sortiment/types/IKeg';

@Pipe({
	name: 'kegById',
	standalone: true,
})
export class KegByIdPipe implements PipeTransform {
	transform(value: number): IKeg | null {
		// TODO: implement loadng from store
		return null;
	}
}
