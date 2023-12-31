import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteDialogComponent } from './invite-dialog.component';

describe('InviteDialogComponent', () => {
	let component: InviteDialogComponent;
	let fixture: ComponentFixture<InviteDialogComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [InviteDialogComponent],
		});
		fixture = TestBed.createComponent(InviteDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
