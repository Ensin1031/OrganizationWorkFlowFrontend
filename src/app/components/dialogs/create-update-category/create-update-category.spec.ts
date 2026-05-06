import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProjectMatObjectDialogComponent } from './create-update-category';

describe('CreateUpdateProjectMatObjectDialogComponent', () => {
  let component: CreateUpdateProjectMatObjectDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectMatObjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectMatObjectDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectMatObjectDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
