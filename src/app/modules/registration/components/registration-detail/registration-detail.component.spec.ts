import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationDetailComponent } from './registration-detail.component';

describe('RegistrationDetailComponent', () => {
	let component: RegistrationDetailComponent;
	let fixture: ComponentFixture<RegistrationDetailComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RegistrationDetailComponent],
		});
		fixture = TestBed.createComponent(RegistrationDetailComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
