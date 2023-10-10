import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
	selector: '[appConfirm]',
	standalone: true,
	providers: [ConfirmationService],
	imports: [ConfirmPopupModule],
	template: '<p-confirmPopup></p-confirmPopup>',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmComponent {
	protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);

	@Input('confirmMessage') message: string = 'Potvrdit';

	@Output('confirm') confirm: any = new EventEmitter();

	@HostListener('click', ['$event'])
	public onClick(event: MouseEvent) {
		this.confirmationService.confirm({
			target: event.target as EventTarget,
			message: this.message,
			acceptLabel: 'Ano',
			rejectLabel: 'Ne',
			accept: () => {
				this.confirm.emit(event);
			},
			reject: () => {},
		});
	}
}
