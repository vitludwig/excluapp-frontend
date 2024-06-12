import { inject, Pipe, PipeTransform } from '@angular/core';
import { EventService } from '../../../services/event/event.service';
import { IEvent } from '../../../types/IEvent';

@Pipe({
	name: 'eventById',
	standalone: true,
})
export class EventByIdPipe implements PipeTransform {
	private readonly eventService = inject(EventService);

	transform(value: number): IEvent | null {
		return this.eventService.$events().find((event) => event.id === value) ?? null;
	}
}