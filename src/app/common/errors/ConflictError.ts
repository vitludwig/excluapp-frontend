export class ConflictError extends Error {
	constructor(message: string = 'Entita kterou se snažíš přidat již existuje') {
		super(message);
		this.name = 'ConflictError';
	}
}
