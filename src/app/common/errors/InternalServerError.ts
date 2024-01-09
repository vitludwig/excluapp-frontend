export class InternalServerError extends Error {
	constructor(message?: string) {
		super(message);
		this.message = 'Neznámá chyba serveru';
		this.name = 'InternalServerError';
	}
}
