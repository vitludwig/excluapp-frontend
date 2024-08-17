import { AsyncPipe, CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SortPipe } from '@common/pipes/sort.pipe';
import { AuthService } from '@common/services/auth.service';
import { EventStore } from '@modules/event/event.store';
import { EventByIdPipe } from '@modules/event/pipes/eventById.pipe';
import { EventService } from '@modules/event/services/event/event.service';
import { IEvent } from '@modules/event/types/IEvent';
import { OrderService } from '@modules/sale/services/order/order.service';
import { SelectUserComponent } from '@modules/user/components/select-user/select-user.component';
import { UserByIdPipe } from '@modules/user/pipes/user-by-id.pipe';
import { IUser } from '@modules/user/types/IUser';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { of } from 'rxjs';
import { KegByIdPipe } from '../../../sortiment/pipes/kegById.pipe';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ButtonModule,
		MultiSelectModule,
		SortPipe,
		FormsModule,
		SelectUserComponent,
		AsyncPipe,
		JsonPipe,
		TableModule,
		KegByIdPipe,
		EventByIdPipe,
		DatePipe,
		TooltipModule,
		CurrencyPipe,
		KegByIdPipe,
		UserByIdPipe,
	],
	selector: 'app-user-statistics',
	standalone: true,
	styleUrls: ['./user-statistics.component.scss'],
	templateUrl: './user-statistics.component.html',
})
export class UserStatisticsComponent {
	protected readonly eventStore = inject(EventStore);

	protected readonly eventService = inject(EventService);
	protected readonly orderService = inject(OrderService);
	protected readonly authService: AuthService = inject(AuthService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $selectedUser = signal<IUser | null>(null);

	protected $userOrders = computed(() => {
		const user = this.$selectedUser();
		const events = this.$selectedEvents();
		const userIds = user ? [user.id] : undefined;
		const eventIds = events.map((e) => e.id) ?? undefined;

		if (userIds || eventIds.length > 0) {
			return this.orderService.getTransactions(userIds, eventIds);
		}

		return of([]);
	});

	constructor() {}

	protected selectUser(user: IUser | null) {
		this.$selectedUser.set(user);
	}
}
