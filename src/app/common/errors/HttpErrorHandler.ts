import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { InternalServerError } from './InternalServerError';
import { UnprocessableEntityError } from './UnprocessableEntityError';

@Injectable({
	providedIn: 'root',
})
export class HttpErrorHandler implements ErrorHandler {
	private readonly notificationService: NotificationService = inject(NotificationService);

	handleError(error: unknown): void {
		let errorInstance: Error;

		if (error instanceof HttpErrorResponse) {
			switch (error.status) {
				case 422:
					errorInstance = new UnprocessableEntityError();
					this.notificationService.error(errorInstance.message);
					throw errorInstance;

				case 500:
					errorInstance = new InternalServerError();
					this.notificationService.error(error.message);
					throw error;

				default:
					this.notificationService.error('Vyskytla se neznámá chyba');
					console.error(error);
					throw new Error(error.message);
			}
		}

		console.error(error);
	}
}
