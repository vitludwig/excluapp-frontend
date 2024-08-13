import { Pipe, PipeTransform } from '@angular/core';

/**
 * Return only items from wholeSet that are not included in subSet
 */
@Pipe({
	name: 'distinctFrom',
	standalone: true,
})
export class DistinctFromPipe<T> implements PipeTransform {
	// TODO: remove any
	transform(wholeSet: any[], subSet: any[]): T[] {
		const subsetIds = subSet.map((obj) => obj.id);
		return wholeSet.filter((obj) => !subsetIds.includes(obj.id));
	}
}
