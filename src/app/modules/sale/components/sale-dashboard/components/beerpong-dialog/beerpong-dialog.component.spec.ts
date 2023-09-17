import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeerpongDialogComponent } from './beerpong-dialog.component';

describe('BeerpongDialogComponent', () => {
  let component: BeerpongDialogComponent;
  let fixture: ComponentFixture<BeerpongDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BeerpongDialogComponent]
    });
    fixture = TestBed.createComponent(BeerpongDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
