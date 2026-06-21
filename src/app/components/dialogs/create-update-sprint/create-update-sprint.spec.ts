import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

import { CreateUpdateSprintDialogComponent } from './create-update-sprint';

describe('CreateUpdateSprintDialogComponent', () => {
  let component: CreateUpdateSprintDialogComponent;
  let fixture: ComponentFixture<CreateUpdateSprintDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateSprintDialogComponent],
      providers: [
        provideNativeDateAdapter(),

        {
          provide: MatDialogRef,
          useValue: {
            close: () => {},
          },
        },

        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'create',
            title: 'Создание спринта',
            sprint: undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateSprintDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
