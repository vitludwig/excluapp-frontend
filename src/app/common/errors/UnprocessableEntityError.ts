export class UnprocessableEntityError extends Error {
	constructor(message: string = 'Položka nemohla být zpracována') {
		super(message);
		this.name = 'UnprocessableEntityError';
	}
}
