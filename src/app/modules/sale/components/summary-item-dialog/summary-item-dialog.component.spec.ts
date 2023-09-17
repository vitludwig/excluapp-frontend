import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryItemDialogComponent } from './summary-item-dialog.component';

describe('SummaryItemDialogComponent', () => {
  let component: SummaryItemDialogComponent;
  let fixture: ComponentFixture<SummaryItemDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SummaryItemDialogComponent]
    });
    fixture = TestBed.createComponent(SummaryItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
