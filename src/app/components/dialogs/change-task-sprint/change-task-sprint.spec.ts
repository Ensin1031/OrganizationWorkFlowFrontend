import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTaskSprintDialogComponent } from './change-task-sprint';

describe('ChangeTaskSprintDialogComponent', () => {
  let component: ChangeTaskSprintDialogComponent;
  let fixture: ComponentFixture<ChangeTaskSprintDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTaskSprintDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeTaskSprintDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
