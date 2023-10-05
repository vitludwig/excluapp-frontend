import { Pipe, PipeTransform } from '@angular/core';
import { TSortimentCategory } from '../types/TSortimentCategory';

@Pipe({
	name: 'asSortimentCategory',
	standalone: true,
})
export class AsSortimentCategoryPipe implements PipeTransform {
	transform(value: string): TSortimentCategory {
		return value as TSortimentCategory;
	}
}
