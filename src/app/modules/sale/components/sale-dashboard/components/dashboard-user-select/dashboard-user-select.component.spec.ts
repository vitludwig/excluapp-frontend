import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUserSelectComponent } from './dashboard-user-select.component';

describe('DashboardUserSelectComponent', () => {
  let component: DashboardUserSelectComponent;
  let fixture: ComponentFixture<DashboardUserSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardUserSelectComponent]
    });
    fixture = TestBed.createComponent(DashboardUserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
