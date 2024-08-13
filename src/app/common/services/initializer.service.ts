import { APP_INITIALIZER, inject, Injectable, Provider } from '@angular/core';
import { EventService } from '@modules/event/services/event/event.service';
import { SortimentService } from '@modules/sortiment/services/sortiment/sortiment.service';
import { FaceRecognitionService } from '@modules/user/services/face-recognition/face-recognition.service';
import { UserService } from '@modules/user/services/user/user.service';
import { UserStore } from '@modules/user/user.store';
import { firstValueFrom } from 'rxjs';

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
	private readonly eventService = inject(EventService);
	private readonly faceRecognitionService = inject(FaceRecognitionService);
	private readonly userService = inject(UserService);
	private readonly userStore = inject(UserStore);

	public async initialize(): Promise<void> {
		// await firstValueFrom(this.sortimentService.loadSortiment());
		await firstValueFrom(this.eventService.loadEvents());
		await this.userService.getUsers();
		if (this.faceRecognitionService.$faceRecognitionEnabled()) {
			await this.faceRecognitionService.loadModels();
		}
	}
}
