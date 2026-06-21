import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {
    title: '',
    message: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
