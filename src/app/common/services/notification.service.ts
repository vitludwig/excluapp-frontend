import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	private messageService: MessageService = inject(MessageService);

	public success(message: string): void {
		this.messageService.add({ severity: 'success', summary: 'Olé', detail: message });
	}

	public error(message: string): void {
		this.messageService.add({ severity: 'error', summary: 'Chyba', detail: message });
	}
}
