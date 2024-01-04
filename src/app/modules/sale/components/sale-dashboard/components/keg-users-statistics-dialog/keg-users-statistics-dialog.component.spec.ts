import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KegUsersStatisticsDialogComponent } from './keg-users-statistics-dialog.component';

describe('KegUsersStatisticsDialogComponent', () => {
  let component: KegUsersStatisticsDialogComponent;
  let fixture: ComponentFixture<KegUsersStatisticsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KegUsersStatisticsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KegUsersStatisticsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
