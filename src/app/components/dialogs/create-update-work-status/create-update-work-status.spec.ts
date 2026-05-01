import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateWorkStatusDialogComponent } from './create-update-work-status';

describe('CreateUpdateWorkStatusDialogComponent', () => {
  let component: CreateUpdateWorkStatusDialogComponent;
  let fixture: ComponentFixture<CreateUpdateWorkStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateWorkStatusDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateWorkStatusDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
