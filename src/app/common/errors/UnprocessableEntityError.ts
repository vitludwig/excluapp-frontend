export class UnprocessableEntityError extends Error {
	constructor(message?: string) {
		super(message);
		this.message = 'Položka nemohla být zpracována';
		this.name = 'UnprocessableEntityError';
	}
}
