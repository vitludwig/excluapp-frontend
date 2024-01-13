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
import { IUserRead } from '../../../../../user/types/IUser';
import { EventService } from '../../../../services/event/event.service';
import { IEvent } from '../../../../types/IEvent';
import { EventPipe } from '../../../events/pipes/event.pipe';
import { KegPipe } from '../../../sortiment/pipes/keg.pipe';

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
		KegPipe,
		EventPipe,
		DatePipe,
		TooltipModule,
		CurrencyPipe,
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
		if (user && events.length) {
			return this.orderService.getUsersTransactions(
				user.id,
				events.map((e) => e.id),
			);
		}

		return of([]);
	});

	protected selectUser(users: IUserRead | null) {
		this.$selectedUser.set(users);
	}
}
