import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeKegDialogComponent } from './change-keg-dialog.component';

describe('ChangeKegDialogComponent', () => {
  let component: ChangeKegDialogComponent;
  let fixture: ComponentFixture<ChangeKegDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeKegDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeKegDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
