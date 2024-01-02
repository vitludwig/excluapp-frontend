import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFaceScanDescriptorComponent } from './user-face-scan-descriptor.component';

describe('UserFaceScanDescriptorComponent', () => {
  let component: UserFaceScanDescriptorComponent;
  let fixture: ComponentFixture<UserFaceScanDescriptorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFaceScanDescriptorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFaceScanDescriptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
