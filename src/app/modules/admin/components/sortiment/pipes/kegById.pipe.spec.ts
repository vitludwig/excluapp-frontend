import { KegByIdPipe } from './keg.pipe';

describe('KegPipe', () => {
	it('create an instance', () => {
		const pipe = new KegByIdPipe();
		expect(pipe).toBeTruthy();
	});
});
