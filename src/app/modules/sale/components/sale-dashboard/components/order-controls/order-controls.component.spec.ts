import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderControlsComponent } from './order-controls.component';

describe('OrderControlsComponent', () => {
  let component: OrderControlsComponent;
  let fixture: ComponentFixture<OrderControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
