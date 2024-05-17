import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'subtract',
	standalone: true,
})
export class SubtractPipe implements PipeTransform {
	transform<T extends object>(sourceArray: T[], subtractArray: T[], subtractBy?: keyof T): T[] {
		return sourceArray.filter((sourceItem) => {
			return !subtractArray.some((subtractItem) => {
				return subtractBy ? sourceItem[subtractBy] === subtractItem[subtractBy] : sourceItem === subtractItem;
			});
		});
	}
}
