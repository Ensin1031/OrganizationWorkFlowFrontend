import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTaskSprintDialogComponent } from './change-task-sprint';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('ChangeTaskSprintDialogComponent', () => {
  let component: ChangeTaskSprintDialogComponent;
  let fixture: ComponentFixture<ChangeTaskSprintDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {
    task: {
      sprint: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTaskSprintDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeTaskSprintDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
