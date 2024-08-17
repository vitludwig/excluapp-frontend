import { APP_INITIALIZER, inject, Injectable, Provider } from '@angular/core';
import { FaceRecognitionService } from '@modules/user/services/face-recognition/face-recognition.service';

@Injectable({
	providedIn: 'root',
})
export class InitializerService {
	public static readonly APP_INITIALIZER_PROVIDER: Provider = {
		provide: APP_INITIALIZER,
		multi: true,
		useFactory:
			(initializer: InitializerService): ((...args: unknown[]) => void) =>
			() => {
				return initializer.initialize();
			},
		deps: [InitializerService],
	};

	private readonly faceRecognitionService = inject(FaceRecognitionService);

	public async initialize(): Promise<void> {
		if (this.faceRecognitionService.$faceRecognitionEnabled()) {
			await this.faceRecognitionService.loadModels();
		}
	}
}
