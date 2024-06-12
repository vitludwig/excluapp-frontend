import { AsyncPipe, CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { of } from 'rxjs';
import { SortPipe } from '../../../../../../common/pipes/sort.pipe';
import { AuthService } from '../../../../../../common/services/auth.service';
import { OrderService } from '../../../../../sale/services/order/order.service';
import { SelectUserComponent } from '../../../../../user/components/select-user/select-user.component';
import { UserByIdPipe } from '../../../../../user/pipes/user-by-id.pipe';
import { IUserRead } from '../../../../../user/types/IUser';
import { EventService } from '../../../../services/event/event.service';
import { IEvent } from '../../../../types/IEvent';
import { EventByIdPipe } from '../../../events/pipes/eventById.pipe';
import { KegByIdPipe } from '../../../sortiment/pipes/kegById.pipe';

@Component({
	selector: 'app-user-statistics',
	standalone: true,
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
	templateUrl: './user-statistics.component.html',
	styleUrls: ['./user-statistics.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatisticsComponent {
	protected readonly eventService = inject(EventService);
	protected readonly orderService = inject(OrderService);
	protected readonly authService: AuthService = inject(AuthService);

	protected $selectedEvents = signal<IEvent[]>([]);
	protected $selectedUser = signal<IUserRead | null>(null);

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

	protected selectUser(user: IUserRead | null) {
		this.$selectedUser.set(user);
	}
}
