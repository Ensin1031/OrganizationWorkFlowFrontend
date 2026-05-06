import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProjectDialogComponent } from './create-update-project';

describe('CreateUpdateProjectDialogComponent', () => {
  let component: CreateUpdateProjectDialogComponent;
  let fixture: ComponentFixture<CreateUpdateProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateProjectDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateProjectDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
