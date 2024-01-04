import { Injectable } from '@angular/core';
import { loadFaceExpressionModel, loadFaceLandmarkModel, loadFaceRecognitionModel, loadTinyFaceDetectorModel } from 'face-api.js';

@Injectable({
	providedIn: 'root',
})
export class FaceRecognitionService {
	public get faceRecognitionEnabled(): boolean {
		return localStorage.getItem('faceRecognitionEnabled') === 'true';
	}

	public set faceRecognitionEnabled(value: boolean) {
		localStorage.setItem('faceRecognitionEnabled', value.toString());
	}

	public get overlayEnabled(): boolean {
		return localStorage.getItem('faceRecognitionOverlay') === 'true';
	}

	public set overlayEnabled(value: boolean) {
		localStorage.setItem('faceRecognitionOverlay', value.toString());
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
