import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFaceRecognitionComponent } from './user-face-recognition.component';

describe('UserFaceRecognitionComponent', () => {
	let component: UserFaceRecognitionComponent;
	let fixture: ComponentFixture<UserFaceRecognitionComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [UserFaceRecognitionComponent],
		});
		fixture = TestBed.createComponent(UserFaceRecognitionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
