import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSprintDialogComponent } from './create-update-sprint';

describe('CreateUpdateSprintDialogComponent', () => {
  let component: CreateUpdateSprintDialogComponent;
  let fixture: ComponentFixture<CreateUpdateSprintDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateSprintDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateSprintDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
