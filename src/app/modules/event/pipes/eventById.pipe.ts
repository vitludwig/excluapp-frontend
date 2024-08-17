import { inject, Pipe, PipeTransform } from '@angular/core';
import { EventStore } from '@modules/event/event.store';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';

@Pipe({
	name: 'eventById',
	standalone: true,
})
export class EventByIdPipe implements PipeTransform {
	private readonly eventStore = inject(EventStore);
	private readonly eventService = inject(EventService);

	transform(value: number): IEvent | null {
		return this.eventStore.getById(value);
	}
}
