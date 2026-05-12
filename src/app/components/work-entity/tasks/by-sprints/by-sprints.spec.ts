import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksBySprintsComponent } from './by-sprints';

describe('TasksBySprintsComponent', () => {
  let component: TasksBySprintsComponent;
  let fixture: ComponentFixture<TasksBySprintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksBySprintsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksBySprintsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
