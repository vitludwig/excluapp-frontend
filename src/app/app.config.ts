import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { HttpErrorHandler } from '@common/errors/HttpErrorHandler';
import { InitializerService } from '@common/services/initializer.service';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideAnimations(),
		provideHttpClient(),
		{ provide: ErrorHandler, useClass: HttpErrorHandler },
		MessageService,
		InitializerService.APP_INITIALIZER_PROVIDER,
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
};
