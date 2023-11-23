import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaydayTableComponent } from './payday-table.component';

describe('PaydayTableComponent', () => {
  let component: PaydayTableComponent;
  let fixture: ComponentFixture<PaydayTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaydayTableComponent]
    });
    fixture = TestBed.createComponent(PaydayTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
