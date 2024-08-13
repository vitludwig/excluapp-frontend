import { TestBed } from '@angular/core/testing';

import { SortimentService } from './sortiment.service';

describe('SortimentService', () => {
	let service: SortimentService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SortimentService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
