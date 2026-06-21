import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSprintUsersLoadDialogComponent } from './view-sprint-users-load';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('ViewSprintUsersLoadDialogComponent', () => {
  let component: ViewSprintUsersLoadDialogComponent;
  let fixture: ComponentFixture<ViewSprintUsersLoadDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {
    sprint: {
      slug: '',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSprintUsersLoadDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSprintUsersLoadDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
