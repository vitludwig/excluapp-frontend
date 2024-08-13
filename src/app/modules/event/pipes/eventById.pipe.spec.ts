import { EventByIdPipe } from './eventById.pipe';

describe('EventPipe', () => {
	it('create an instance', () => {
		const pipe = new EventByIdPipe();
		expect(pipe).toBeTruthy();
	});
});
