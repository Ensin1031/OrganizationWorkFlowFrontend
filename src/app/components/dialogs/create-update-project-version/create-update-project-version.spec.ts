import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUpdateProjectVersionDialogComponent } from './create-update-project-version';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('CreateUpdateProjectVersionDialogComponent', () => {
  let component: CreateUpdateProjectVersionDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectVersionDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {
    title: 'Test title',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectVersionDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectVersionDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
