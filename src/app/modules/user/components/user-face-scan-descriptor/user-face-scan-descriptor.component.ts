import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import {
	detectSingleFace,
	FaceDetection,
	FaceLandmarks68,
	LabeledFaceDescriptors,
	TinyFaceDetectorOptions,
	WithFaceDescriptor,
	WithFaceExpressions,
	WithFaceLandmarks,
} from 'face-api.js';
import { FaceExpressions } from 'face-api.js/build/commonjs/faceExpressionNet/FaceExpressions';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { firstValueFrom } from 'rxjs';
import { FaceRecognitionService } from '../../services/face-recognition/face-recognition.service';
import { UserService } from '../../services/user/user.service';
import { IUserRead } from '../../types/IUser';
import { FaceScanningError, MoodScanningError } from '../user-face-recognition/types/FaceScanningError';

/**
 * Scans new face definition for user and save it
 */
@Component({
	selector: 'app-user-face-scan-descriptor',
	standalone: true,
	imports: [ButtonModule, InputGroupModule],
	templateUrl: './user-face-scan-descriptor.component.html',
	styleUrl: './user-face-scan-descriptor.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [],
})
export class UserFaceScanDescriptorComponent implements OnInit {
	protected readonly faceRecognitionService = inject(FaceRecognitionService);
	protected readonly usersService = inject(UserService);
	private readonly messageService: MessageService = inject(MessageService);

	@Input()
	public user: IUserRead | null = null;

	@ViewChild('videoElement')
	public videoElement: ElementRef<HTMLVideoElement>;

	protected $scanning = signal<boolean>(false);
	protected $faceScanned = signal<boolean>(false);
	private recognitionAttempts = 0;

	public async ngOnInit(): Promise<void> {
		await this.faceRecognitionService.loadModels();
		await this.faceRecognitionService.initWebcam(this.videoElement.nativeElement);
	}

	protected async startScanningDescriptor(): Promise<void> {
		if (!this.user) {
			// TODO: add alert
			return;
		}

		this.$scanning.set(true);
		this.$faceScanned.set(false);
		this.recognitionAttempts = 0;

		try {
			const face = await this.detectFace();

			console.log('result', face);
			if (face) {
				const descriptor = new LabeledFaceDescriptors(this.user.id.toString(), [face.descriptor]);
				await firstValueFrom(this.usersService.updateUser(this.user.id, { faceDescriptor: JSON.stringify(descriptor) }));
				console.log('descriptor saved!');
				this.$scanning.set(false);
				this.$faceScanned.set(true);
			}
		} catch (e) {
			console.error('Face detection error', e);
			this.$scanning.set(false);
			this.$faceScanned.set(false);
		}
	}

	protected async removeUserDescriptor(): Promise<void> {
		if (this.user) {
			await firstValueFrom(this.usersService.updateUser(this.user.id, { faceDescriptor: null }));
			this.messageService.add({ severity: 'success', summary: 'Obličej odstraněn!', detail: '' });
		}
	}

	/**
	 * Recursively detect face until scanned and it's happy or neutral
	 * @private
	 */
	private async detectFace(): Promise<WithFaceExpressions<WithFaceDescriptor<WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68>>> | void> {
		if (this.recognitionAttempts >= 10) {
			throw new FaceScanningError('Too many attempts');
		}

		try {
			const result = await detectSingleFace(this.videoElement.nativeElement, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor().withFaceExpressions();
			console.log('result', result);
			if (!result || !this.checkScanMood(result?.expressions)) {
				this.recognitionAttempts++;
				await this.detectFace();
				return;
			}
			return result;
		} catch (e) {
			if (e instanceof MoodScanningError) {
				console.warn('Mood check error', e.message);
			} else {
				console.error('Face detection error', e);
			}
			await this.detectFace();
		}
	}

	private checkScanMood(expressions: FaceExpressions): boolean {
		console.log('mood', expressions);
		if (expressions.neutral > 0.5 || expressions.happy > 0.5) {
			return true;
		} else {
			throw new MoodScanningError('Přestaň dělat pičoviny!');
		}
	}
}
