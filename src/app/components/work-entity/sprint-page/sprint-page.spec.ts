import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintPageComponent } from './sprint-page';

describe('SprintPageComponent', () => {
  let component: SprintPageComponent;
  let fixture: ComponentFixture<SprintPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
