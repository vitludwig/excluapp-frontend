import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortimentPriceComponent } from './sortiment-price.component';

describe('SortimentPriceComponent', () => {
  let component: SortimentPriceComponent;
  let fixture: ComponentFixture<SortimentPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortimentPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortimentPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
