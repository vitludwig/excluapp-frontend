import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EBeerVolume } from '@modules/sale/types/EBeerVolume';
import { IKeg } from '@modules/sortiment/types/IKeg';
import { IUser } from '@modules/user/types/IUser';

@Component({
	selector: 'app-sortiment-price',
	standalone: true,
	imports: [DecimalPipe],
	templateUrl: './sortiment-price.component.html',
	styleUrl: './sortiment-price.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortimentPriceComponent {
	public $keg = input.required<IKeg>({ alias: 'keg' });
	public $volume = input.required<EBeerVolume>({ alias: 'volume' });
	public $user = input.required<IUser>({ alias: 'user' });

	protected $sortimentPrice = computed(() => {
		const keg = this.$keg();
		if (!keg) {
			return null;
		}
		return (keg.price / keg.volume) * (this.$volume() === EBeerVolume.SMALL ? 0.3 : 0.5) + (3 + (this.$user().isRegular ? 0 : 5));
	});
}
