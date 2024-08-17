import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSortimentStatisticsComponent } from './dashboard-sortiment-statistics.component';

describe('DashboardSortimentStatisticsComponent', () => {
  let component: DashboardSortimentStatisticsComponent;
  let fixture: ComponentFixture<DashboardSortimentStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSortimentStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSortimentStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
