import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'truncate',
	standalone: true,
})
export class TruncatePipe implements PipeTransform {
	
	public transform(value: string | null | undefined, limit: number = 25, completeWords: boolean = false, ellipsis: string = '…'): string {
		
		// To allow chaining with async pipe
		if(!value) {
			return '';
		}
		
		if(limit <= 0) {
			return value;
		}
		
		if(completeWords) {
			limit = value.substring(0, limit).lastIndexOf(' ');
		}
		
		return value.length > limit ? value.substring(0, limit) + ellipsis : value;
	}
	
}
