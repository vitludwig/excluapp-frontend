import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sort',
	standalone: true,
})
export class SortPipe implements PipeTransform {
	public transform<T>(value: T, propertyName: string, direction: 'asc' | 'desc' = 'desc'): T {
		if (!Array.isArray(value)) {
			return value;
		}

		return value.sort((a, b) => {
			if (!isNaN(a[propertyName]) && !isNaN(b[propertyName])) {
				a[propertyName] = Number(a[propertyName]);
				b[propertyName] = Number(b[propertyName]);
			}
			if (a[propertyName] > b[propertyName]) {
				return direction === 'asc' ? 1 : -1;
			} else if (a[propertyName] < b[propertyName]) {
				return direction === 'asc' ? -1 : 1;
			} else {
				return 0;
			}
		});
	}
}
