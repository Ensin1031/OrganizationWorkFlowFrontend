import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProjectMatObjectDialogComponent } from './create-update-category';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('CreateUpdateProjectMatObjectDialogComponent', () => {
  let component: CreateUpdateProjectMatObjectDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectMatObjectDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectMatObjectDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectMatObjectDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
