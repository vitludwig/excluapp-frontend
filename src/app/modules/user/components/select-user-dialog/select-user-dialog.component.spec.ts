import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUserDialogComponent } from './select-user-dialog.component';

describe('AttendModalComponent', () => {
	let component: SelectUserDialogComponent;
	let fixture: ComponentFixture<SelectUserDialogComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SelectUserDialogComponent],
		});
		fixture = TestBed.createComponent(SelectUserDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
