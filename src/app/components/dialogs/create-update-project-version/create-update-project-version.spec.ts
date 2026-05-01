import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProjectVersionDialogComponent } from './create-update-project-version';

describe('CreateUpdateProjectVersionDialogComponent', () => {
  let component: CreateUpdateProjectVersionDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectVersionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectVersionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectVersionDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
