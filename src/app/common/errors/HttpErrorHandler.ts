import { ErrorHandler, inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UnprocessableEntityError } from './UnprocessableEntityError';
import { InternalServerError } from './InternalServerError';
import { NotificationService } from '../services/notification.service';

@Injectable({
	providedIn: 'root',
})
export class HttpErrorHandler implements ErrorHandler {
	private readonly notificationService: NotificationService = inject(NotificationService);

	handleError(error: HttpErrorResponse): void {
		let errorInstance: Error;

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
}
