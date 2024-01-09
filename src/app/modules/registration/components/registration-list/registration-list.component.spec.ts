import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationListComponent } from './registration-list.component';

describe('RegistrationListComponent', () => {
	let component: RegistrationListComponent;
	let fixture: ComponentFixture<RegistrationListComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RegistrationListComponent],
		});
		fixture = TestBed.createComponent(RegistrationListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
