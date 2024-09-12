import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '@common/services/notification.service';
import { MockComponent, MockModule, MockProvider, MockService } from 'ng-mocks';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { TopbarComponent } from './layout/components/topbar/topbar.component';
import { LayoutService } from './layout/services/layout/layout.service';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let routerEventsSubject: Subject<any>;
	const mockNotificationService = MockService(NotificationService);
	const mockLayoutService = MockService(LayoutService);

	beforeEach(async () => {
		routerEventsSubject = new Subject<any>();

		await TestBed.configureTestingModule({
			imports: [AppComponent, MockComponent(SidebarComponent), MockComponent(TopbarComponent), MockModule(ToastModule), MockModule(ConfirmPopupModule)],

			providers: [
				MockProvider(ConfirmationService),
				MockProvider(MessageService),
				{ provide: NotificationService, useValue: mockNotificationService },
				{ provide: LayoutService, useValue: mockLayoutService },
				{
					provide: Router,
					useValue: {
						events: routerEventsSubject.asObservable(),
					},
				},
			],
		}).compileComponents();

		spyOn(mockNotificationService, 'success');

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the app', () => {
		expect(component).toBeTruthy();
	});

	// it('should set sidebarVisible to false on NavigationEnd', () => {
	// 	routerEventsSubject.next(new NavigationEnd(1, '/', '/'));
	// 	expect(mockLayoutService.$sidebarVisible()).toBe(false);
	// });
	//
	// it('should show network alert when internet connection is lost', () => {
	// 	spyOnProperty(navigator, 'onLine').and.returnValue(false);
	// 	const offlineEvent = new Event('offline');
	// 	window.dispatchEvent(offlineEvent);
	// 	const overlay = fixture.debugElement.query(By.css('.page-overlay-text'));
	// 	expect(overlay).toBeDefined();
	// });
	//
	// it('should show success notification when internet connection is back', () => {
	// 	spyOnProperty(navigator, 'onLine').and.returnValue(true);
	// 	const onlineEvent = new Event('online');
	// 	window.dispatchEvent(onlineEvent);
	//
	// 	const overlay = fixture.debugElement.query(By.css('.page-overlay-text'));
	// 	expect(overlay).toBeFalsy();
	// });
});
