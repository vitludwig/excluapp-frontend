import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EventService } from '../../../admin/services/event/event.service';
import { IEvent } from '../../../admin/types/IEvent';
import { IKeg } from '../../../admin/types/IKeg';
import { EBeerVolume } from '../../types/EBeerVolume';
import { ICartItem } from '../../types/ICartItem';
import { IOrderCreate, IOrderRead } from '../../types/IOrder';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private readonly eventService = inject(EventService);
	private readonly http = inject(HttpClient);

	public $activeEvent = signal<IEvent | null>(null);
	public $cart = signal<ICartItem[]>([]);
	public $orderProcessing = signal<boolean>(false);

	// TODO: write this using reduce maybe?
	public $cartCount = computed(() => {
		const result: Record<EBeerVolume | 'beerpong', Record<string, number>> = {
			[EBeerVolume.BIG]: {},
			[EBeerVolume.SMALL]: {},
			beerpong: {},
		};

		for (const item of this.$cart()) {
			const category = item.isBeerpong ? 'beerpong' : item.volume === EBeerVolume.BIG ? EBeerVolume.BIG : EBeerVolume.SMALL;
			if (!result[category][item.kegId]) {
				result[category][item.kegId] = 1;
			} else {
				result[category][item.kegId]++;
			}
		}
		return result;
	});

	constructor() {
		const activeEventId = localStorage.getItem('activeEvent');
		if (activeEventId) {
			this.$activeEvent.set(this.eventService.$events().find((e) => e.id === +activeEventId) ?? null);
		}
	}

	public addOrder(value: IOrderCreate): Observable<IOrderRead> {
		return this.http.post<IOrderRead>(environment.apiUrl + '/order', value);
	}

	public removeOrder(id: number): Observable<IOrderRead> {
		return this.http.delete<IOrderRead>(environment.apiUrl + '/order/' + id);
	}

	public getOrderByEventUserId(eventId: number, userId: number): Observable<IOrderRead[]> {
		if (!eventId || !userId) {
			throw Error('Summary loading error: User or event not filled!');
		}
		return this.http.get<IOrderRead[]>(`${environment.apiUrl}/order/event-user/${eventId}/${userId}`);
	}

	public addOneToCart(kegId: number, userId: number, volume: EBeerVolume = EBeerVolume.BIG, isBeerpong: boolean = false, $event?: MouseEvent) {
		if ($event) {
			$event.stopPropagation();
		}

		this.$cart.update((cart) => [...cart, { userId, kegId, isBeerpong, volume }]);
	}

	public removeOneFromCart(value: IKeg, $event: MouseEvent, volume: EBeerVolume) {
		if ($event) {
			$event.stopPropagation();
		}
		this.$cart.update((cart) => {
			// remove only first occurrence, because there might be multiple duplicate items
			const index = cart.findIndex((obj) => obj.kegId === value.id && obj.volume === volume);
			if (index !== -1) {
				cart.splice(index, 1);
			}
			return [...cart];
		});
	}

	public confirmOrder() {
		this.$orderProcessing.set(true);

		const requests = [];
		for (const item of this.$cart()) {
			const req = this.addOrder({
				userId: item.userId,
				kegId: item.kegId,
				volume: item.volume,
				eventId: this.eventService.$activeEvent()?.id!,
			});
			requests.push(req);
		}

		return forkJoin(requests).pipe(
			tap(() => {
				this.$orderProcessing.set(false);
				this.clearOrder();
			}),
		);
	}

	public clearOrder() {
		this.$cart.set([]);
	}
}
