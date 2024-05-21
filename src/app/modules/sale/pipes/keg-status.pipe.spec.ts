import { KegStatusPipe } from './keg-status.pipe';

describe('KegStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new KegStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
