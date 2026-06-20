import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUpdateWorkDialogComponent } from './create-update-work';

describe('CreateUpdateWorkDialogComponent', () => {
  let component: CreateUpdateWorkDialogComponent;
  let fixture: ComponentFixture<CreateUpdateWorkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateWorkDialogComponent],
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
            title: 'Создание задачи',
            work: null,
            sprint: null,
            project: null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateWorkDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
