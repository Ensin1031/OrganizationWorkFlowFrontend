import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateReferenceDialogComponent } from './create-update-reference';

describe('CreateUpdateReferenceDialogComponent', () => {
  let component: CreateUpdateReferenceDialogComponent;
  let fixture: ComponentFixture<CreateUpdateReferenceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateReferenceDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateReferenceDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
