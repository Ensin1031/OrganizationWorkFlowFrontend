import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateWorkDialogComponent } from './create-update-work';

describe('CreateUpdateWorkDialogComponent', () => {
  let component: CreateUpdateWorkDialogComponent;
  let fixture: ComponentFixture<CreateUpdateWorkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateWorkDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateWorkDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
