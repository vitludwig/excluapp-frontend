import { Directive, HostListener, inject } from '@angular/core';
import { Location } from '@angular/common';

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
