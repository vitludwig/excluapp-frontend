import { effect, Injectable, signal } from '@angular/core';
import { loadFaceExpressionModel, loadFaceLandmarkModel, loadFaceRecognitionModel, loadTinyFaceDetectorModel } from 'face-api.js';

@Injectable({
	providedIn: 'root',
})
export class FaceRecognitionService {
	public $faceRecognitionEnabled = signal(localStorage.getItem('faceRecognitionEnabled') === 'true');
	public $faceRecognitionOverlayEnabled = signal(localStorage.getItem('faceRecognitionOverlay') === 'true');

	constructor() {
		effect(() => {
			localStorage.setItem('faceRecognitionEnabled', JSON.stringify(this.$faceRecognitionEnabled()));
			localStorage.setItem('faceRecognitionOverlay', JSON.stringify(this.$faceRecognitionOverlayEnabled()));
		});
	}

	public async loadModels(): Promise<void> {
		// TODO: load models from server if face recognition is enabled
		await loadTinyFaceDetectorModel('/assets/face-models');
		await loadFaceLandmarkModel('/assets/face-models');
		await loadFaceRecognitionModel('/assets/face-models');
		await loadFaceExpressionModel('/assets/face-models');
	}

	public async initWebcam(videoElement: HTMLVideoElement): Promise<void> {
		try {
			if (navigator.mediaDevices.getUserMedia && videoElement) {
				videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
			}
		} catch (e) {
			console.error(e);
			if (e instanceof DOMException) {
				throw new DOMException(e.message, e.name);
			}
		}
	}
}
