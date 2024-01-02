export class FaceScanningError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'FaceScanningError';
	}
}

export class MoodScanningError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MoodScanningError';
	}
}
