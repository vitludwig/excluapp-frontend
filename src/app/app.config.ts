import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { HttpErrorHandler } from './common/errors/HttpErrorHandler';
import { InitializerService } from './common/services/initializer.service';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideAnimations(),
		importProvidersFrom(HttpClientModule),
		{ provide: ErrorHandler, useClass: HttpErrorHandler },
		MessageService,
		InitializerService.APP_INITIALIZER_PROVIDER,
	],
};
