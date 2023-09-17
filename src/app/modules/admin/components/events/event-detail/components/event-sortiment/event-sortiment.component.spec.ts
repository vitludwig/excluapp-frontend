import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSortimentComponent } from './event-sortiment.component';

describe('EventSortimentComponent', () => {
	let component: EventSortimentComponent;
	let fixture: ComponentFixture<EventSortimentComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [EventSortimentComponent],
		});
		fixture = TestBed.createComponent(EventSortimentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
