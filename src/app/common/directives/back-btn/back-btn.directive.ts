import { Location } from '@angular/common';
import { Directive, HostListener, inject } from '@angular/core';

@Directive({
	selector: '[appBackBtn]',
	standalone: true,
})
export class BackBtnDirective {
	private readonly location: Location = inject(Location);

	@HostListener('click')
	public onClick(): void {
		this.location.back();
	}
}
