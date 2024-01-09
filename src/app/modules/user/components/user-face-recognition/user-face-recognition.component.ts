import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { detectSingleFace, FaceMatcher, LabeledFaceDescriptors, TinyFaceDetectorOptions } from 'face-api.js';
import { WebcamModule } from 'ngx-webcam';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FaceRecognitionService } from '../../services/face-recognition/face-recognition.service';
import { UserService } from '../../services/user/user.service';
import { IUserRead } from '../../types/IUser';
import { SelectUserComponent } from '../select-user/select-user.component';
import { FaceScanningError } from './types/FaceScanningError';

@Component({
	selector: 'app-user-face-recognition',
	standalone: true,
	imports: [WebcamModule, SelectUserComponent, ButtonModule, ToastModule],
	templateUrl: './user-face-recognition.component.html',
	styleUrls: ['./user-face-recognition.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [],
})
export class UserFaceRecognitionComponent implements AfterViewInit, OnInit {
	protected readonly usersService = inject(UserService);
	protected readonly faceRecognitionService = inject(FaceRecognitionService);

	@Input()
	public set users(value: IUserRead[] | null) {
		if (!value) {
			return;
		}

		this.detectUser(value);
	}

	private _enabled = true;

	@Input()
	public set enabled(value: boolean) {
		clearTimeout(this.enabledTimeout);
		clearInterval(this.recognitionInterval); // prevent multiple parallel intervals

		if (value && value !== this._enabled) {
			this.enabledTimeout = window.setTimeout(() => {
				if (this.faceRecognitionService.overlayEnabled) {
					this.$showOverlay.set(true);
				} else {
					this.initRecognition();
				}
			}, 5000);
		}

		this._enabled = value;
	}

	public get enabled(): boolean {
		return this._enabled;
	}

	@Output()
	public detected: EventEmitter<IUserRead> = new EventEmitter<IUserRead>();

	private async detectUser(users: IUserRead[]): Promise<void> {
		await this.initMatcher(users);
		// const userId = await this.detectFace();
		// console.log('userId', userId);
	}

	@ViewChild('videoElement')
	public videoElement: ElementRef<HTMLVideoElement>;

	protected $showOverlay = signal<boolean>(true);

	private recognitionAttempts = 0;
	private matcher: FaceMatcher;
	private recognitionInterval: number;
	private enabledTimeout: number;
	private enableRecognition: boolean = true;

	public async ngOnInit(): Promise<void> {
		// this.$detectFaceEnabled.set(false);
		// await this.faceRecognitionService.loadModels();
		// await this.faceRecognitionService.initWebcam(this.videoElement.nativeElement);
		if (!this.faceRecognitionService.overlayEnabled) {
			this.initRecognition();
		}
	}

	public async ngAfterViewInit(): Promise<void> {
		try {
			await this.faceRecognitionService.initWebcam(this.videoElement.nativeElement);
			this.enableRecognition = true;
		} catch (e) {
			this.enableRecognition = false;
			console.error('Error while initializing webcam', e);
			clearInterval(this.recognitionInterval);
		}
	}

	protected initRecognition(): void {
		this.$showOverlay.set(false);
		// TODO: zjistit, proc se rekurzivni funkce zasekne (na detectSingleFace metode - mozna race conditiona kvuli stejnemu vlaknu?)
		this.recognitionInterval = window.setInterval(async () => {
			if (!this.enableRecognition) {
				clearInterval(this.recognitionInterval);
				return;
			}

			if (this.matcher) {
				console.log('detecting');
				const detection = await detectSingleFace(this.videoElement.nativeElement, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

				if (detection) {
					const bestMatch = this.matcher.findBestMatch(detection.descriptor);
					const user = this.usersService.$users().find((user) => user.id.toString() === bestMatch.label) ?? null;
					if (user) {
						this.detected.emit(user);
						clearInterval(this.recognitionInterval);
					} else {
						console.log('No user detected');
						//this.messageService.add({ severity: 'warn', summary: 'Obličej nerozpoznán', detail: '' });
					}
				}
			}
		}, 500);
	}

	private async detectFace(): Promise<string | void> {
		if (this.recognitionAttempts >= 10) {
			throw new FaceScanningError('Too many attempts');
		}

		try {
			const face = await detectSingleFace(this.videoElement.nativeElement, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
			console.log('face', face);
			if (face) {
				const bestMatch = this.matcher.findBestMatch(face.descriptor).toString();
				if (bestMatch) {
					return bestMatch;
				} else {
					this.recognitionAttempts++;
					await this.detectFace();
				}
			} else {
				this.recognitionAttempts++;
				await this.detectFace();
			}
		} catch (e) {
			console.error('Error while detecting face', e);
		}
	}

	private initMatcher(users: IUserRead[]): Promise<void> {
		return new Promise((resolve) => {
			const descriptors = users
				.filter((user) => user.faceDescriptor)
				.map((user) => {
					if (!user.faceDescriptor) {
						return;
					}
					const data = JSON.parse(user.faceDescriptor);
					console.log('data', data);
					return new LabeledFaceDescriptors(
						user.id.toString(),
						data.descriptors.map((obj: any) => Float32Array.from(obj)),
					);
				});

			console.log('descriptors', descriptors);
			if (descriptors.length) {
				this.matcher = new FaceMatcher(descriptors);
			}
			resolve();
		});
	}
}
