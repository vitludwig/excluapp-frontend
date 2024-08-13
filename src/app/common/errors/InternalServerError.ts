export class InternalServerError extends Error {
	constructor(message: string = 'Neznámá chyba serveru') {
		super(message);
		this.name = 'InternalServerError';
	}
}
