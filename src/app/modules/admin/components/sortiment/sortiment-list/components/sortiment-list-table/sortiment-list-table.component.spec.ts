import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortimentListTableComponent } from './sortiment-list-table.component';

describe('SortimentListTableComponent', () => {
  let component: SortimentListTableComponent;
  let fixture: ComponentFixture<SortimentListTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SortimentListTableComponent]
    });
    fixture = TestBed.createComponent(SortimentListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
