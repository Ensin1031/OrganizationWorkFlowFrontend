import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksListComponent } from './tasks-list';

describe('TasksListComponent', () => {
  let component: TasksListComponent;
  let fixture: ComponentFixture<TasksListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksListComponent);

    fixture.componentRef.setInput('filters', {});
    fixture.componentRef.setInput('pageSize', 20);
    fixture.componentRef.setInput('loadHasMoreTasks', null);

    fixture.detectChanges();

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
