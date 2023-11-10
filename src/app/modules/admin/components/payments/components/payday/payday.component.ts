import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { EventService } from '../../../../services/event/event.service';
import { IEvent } from '../../../../types/IEvent';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { forkJoin, map, Observable } from 'rxjs';
import { IEventUsersStatistics } from '../../../../types/IEventKegsStatistics';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { SortPipe } from '../../../../../../common/pipes/sort.pipe';

@Component({
	selector: 'app-payday',
	standalone: true,
	imports: [CommonModule, MultiSelectModule, FormsModule, DropdownModule, ButtonModule, TableModule, SortPipe],
	templateUrl: './payday.component.html',
	styleUrls: ['./payday.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaydayComponent {
	protected readonly eventService = inject(EventService);
	private readonly messageService: MessageService = inject(MessageService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $paydayResult = signal<Observable<IEventUsersStatistics[]> | null>(null);

	protected createPayday(): void {
		const result = forkJoin(this.$selectedEvents().map((event) => this.eventService.getUsersStatistics(event.id))).pipe(
			map((statistics) => {
				return statistics.reduce((accumulator, current) => {
					current.map((c) => {
						let found = accumulator.find((element) => element.order_userId === c.order_userId);
						if (found) {
							found.price = Number(found.price) + Number(c.price);
							found.volume = Number(found.volume) + Number(c.volume);
						} else {
							accumulator.push(c);
						}
					});
					return accumulator;
				});
			}),
		);
		this.$paydayResult.set(result);
	}

	protected async copyPaydayResult(payday: IEventUsersStatistics[]): Promise<void> {
		const result = payday
			.map((value) => {
				return `${value.userName}: ${value.price}Kč`;
			})
			.join('\n');
		await navigator.clipboard.writeText(result);
		this.messageService.add({ severity: 'success', summary: 'Olé!', detail: 'Zkopírováno do schránky' });
	}
}
