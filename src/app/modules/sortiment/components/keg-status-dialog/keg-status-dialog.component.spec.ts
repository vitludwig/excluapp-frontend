import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KegStatusDialogComponent } from './keg-status-dialog.component';

describe('KegStatusDialogComponent', () => {
	let component: KegStatusDialogComponent;
	let fixture: ComponentFixture<KegStatusDialogComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [KegStatusDialogComponent],
		});
		fixture = TestBed.createComponent(KegStatusDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
