import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

import { CreateUpdateProjectDialogComponent } from './create-update-project';

describe('CreateUpdateProjectDialogComponent', () => {
  let component: CreateUpdateProjectDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = { };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
