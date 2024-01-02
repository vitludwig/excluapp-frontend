import { APP_INITIALIZER, inject, Injectable, Provider } from '@angular/core';
import { SortimentService } from '../../modules/admin/services/sortiment/sortiment.service';
import { firstValueFrom } from 'rxjs';
import { FaceRecognitionService } from '../../modules/user/services/face-recognition/face-recognition.service';

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

	private readonly sortimentService = inject(SortimentService);
	private readonly faceRecognitionService = inject(FaceRecognitionService);

	public async initialize(): Promise<void> {
		await firstValueFrom(this.sortimentService.loadSortiment());
		await this.faceRecognitionService.loadModels();
	}
}
