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

	public async loadModels(): Promise<void> {
		await loadTinyFaceDetectorModel('/assets/face-models');
		await loadFaceLandmarkModel('/assets/face-models');
		await loadFaceRecognitionModel('/assets/face-models');
		await loadFaceExpressionModel('/assets/face-models');
	}

	public async initWebcam(videoElement: HTMLVideoElement): Promise<void> {
		if (navigator.mediaDevices.getUserMedia && videoElement) {
			videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
		}
	}
}
