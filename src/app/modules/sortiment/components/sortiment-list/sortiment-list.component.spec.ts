import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortimentListComponent } from './sortiment-list.component';

describe('SortimentListComponent', () => {
	let component: SortimentListComponent;
	let fixture: ComponentFixture<SortimentListComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SortimentListComponent],
		});
		fixture = TestBed.createComponent(SortimentListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
