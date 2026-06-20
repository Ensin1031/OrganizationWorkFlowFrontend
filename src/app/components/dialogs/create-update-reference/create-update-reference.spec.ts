import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUpdateReferenceDialogComponent } from './create-update-reference';

describe('CreateUpdateReferenceDialogComponent', () => {
  let component: CreateUpdateReferenceDialogComponent;
  let fixture: ComponentFixture<CreateUpdateReferenceDialogComponent>;

  const dialogRefMock = {
    close: () => {},
  };

  const matDialogDataMock = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateReferenceDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateReferenceDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
