import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUpdateWorkStatusDialogComponent } from './create-update-work-status';

describe('CreateUpdateWorkStatusDialogComponent', () => {
  let component: CreateUpdateWorkStatusDialogComponent;
  let fixture: ComponentFixture<CreateUpdateWorkStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateWorkStatusDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {},
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Создание статуса',
            status: null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateWorkStatusDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
