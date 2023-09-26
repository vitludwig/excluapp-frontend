import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { InitializerService } from './common/services/initializer.service';

export const appConfig: ApplicationConfig = {
	providers: [provideRouter(routes), provideAnimations(), importProvidersFrom(HttpClientModule), InitializerService.APP_INITIALIZER_PROVIDER],
};
