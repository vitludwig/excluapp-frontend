import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KegStatisticsComponent } from './keg-statistics.component';

describe('KegStatisticsComponent', () => {
  let component: KegStatisticsComponent;
  let fixture: ComponentFixture<KegStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KegStatisticsComponent]
    });
    fixture = TestBed.createComponent(KegStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
