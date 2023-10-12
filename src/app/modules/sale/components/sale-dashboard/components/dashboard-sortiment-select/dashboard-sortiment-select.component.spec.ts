import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSortimentSelectComponent } from './dashboard-sortiment-select.component';

describe('DashboardSortimentSelectComponent', () => {
  let component: DashboardSortimentSelectComponent;
  let fixture: ComponentFixture<DashboardSortimentSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardSortimentSelectComponent]
    });
    fixture = TestBed.createComponent(DashboardSortimentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
