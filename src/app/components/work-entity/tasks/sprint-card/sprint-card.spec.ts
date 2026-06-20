import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { SprintCardComponent, SprintStatus } from './sprint-card';

import { SprintService } from '../../../../services/sprint';
import { WorkService } from '../../../../services/work';
import { UserService } from '../../../../services/user';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, NO_ERRORS_SCHEMA, output } from '@angular/core';
import { TasksListComponent } from '../tasks-list/tasks-list';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  template: '',
})
class MockTasksListComponent {
  sprint = input<any>();
  canCreate = input<boolean>();
  filters = input<any>();
  pageSize = input<number>();
  updateTaskSignal = output<void>();
}


describe('SprintCardComponent', () => {
  let component: SprintCardComponent;
  let fixture: ComponentFixture<SprintCardComponent>;

  let sprintService: any;
  let workService: any;
  let userService: any;
  let dialog: any;

  const sprint: any = {
    id: 1,
    slug: 'sprint-1',
    name: 'Sprint 1',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    in_work: false,
    is_completed: false,
    works_ids: [1, 2, 3],
  };

  beforeEach(async () => {
    sprintService = {
      updateSprint: vi.fn(() => of({})),
      deleteSprint: vi.fn(() => of({})),
    };

    workService = {
      createWork: vi.fn(() => of({})),
    };

    userService = {
      user: vi.fn(() => ({
        id: 777,
      })),
    };

    dialog = {
      open: vi.fn(() => ({
        afterClosed: () => of(true),
      })),
    };

    await TestBed.configureTestingModule({
      imports: [SprintCardComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: SprintService,
          useValue: sprintService,
        },
        {
          provide: WorkService,
          useValue: workService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: MatDialog,
          useValue: dialog,
        },
      ],
    })
      .overrideComponent(SprintCardComponent, {
        remove: {
          imports: [TasksListComponent],
        },
        add: {
          imports: [MockTasksListComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SprintCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('sprint', sprint);
    fixture.componentRef.setInput('canCreateTask', true);
    fixture.componentRef.setInput('canCreateSprint', true);
    fixture.componentRef.setInput('tasksFilters', {});
    fixture.componentRef.setInput('tasksPageSize', 20);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build sprint filters', () => {
    expect(component.getTasksFilters()).toEqual({
      sprint: 'sprint-1',
      without_types: [1, 2],
    });
  });

  it('should calculate sprint dates', () => {
    expect(component.sprintDates).toContain('01.01.2025');
    expect(component.sprintDates).toContain('31.01.2025');
  });

  it('should return NOT_ACTIVE status', () => {
    expect(component.sprintStatus()).toBe(SprintStatus.NOT_ACTIVE);
  });

  it('should return ACTIVE status', () => {
    fixture.componentRef.setInput('sprint', {
      ...sprint,
      in_work: true,
    });

    fixture.detectChanges();

    expect(component.sprintStatus()).toBe(SprintStatus.ACTIVE);
  });

  it('should return CLOSED status', () => {
    fixture.componentRef.setInput('sprint', {
      ...sprint,
      is_completed: true,
    });

    fixture.detectChanges();

    expect(component.sprintStatus()).toBe(SprintStatus.CLOSED);
  });

  it('should return start sprint button text', () => {
    expect(component.changeSprintStatusBTNName()).toBe('Начать спринт');
  });

  it('should return start sprint button color', () => {
    expect(component.changeSprintStatusBTNBackground()).toBe('green');
  });

  it('should toggle task list visibility', () => {
    expect(component.isTaskListOpen).toBe(false);

    component.viewSprintTasks();

    expect(component.isTaskListOpen).toBe(true);

    component.viewSprintTasks();

    expect(component.isTaskListOpen).toBe(false);
  });

  it('should open sprint view dialog', () => {
    component.viewSprint();

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should update sprint', () => {
    component.updateSprint();

    expect(dialog.open).toHaveBeenCalled();
    expect(sprintService.updateSprint).toHaveBeenCalled();
  });

  it('should delete sprint', () => {
    component.deleteSprint();

    expect(sprintService.deleteSprint).toHaveBeenCalledWith('sprint-1');
  });

  it('should not delete active sprint', () => {
    fixture.componentRef.setInput('sprint', {
      ...sprint,
      in_work: true,
    });

    fixture.detectChanges();

    component.deleteSprint();

    expect(sprintService.deleteSprint).not.toHaveBeenCalled();
  });

  it('should create sprint task', () => {
    component.createSprintTask();

    const arg = workService.createWork.mock.calls.at(-1)?.[0];

    expect(arg).toBeTruthy();
    expect(arg.created_by_id).toBe(777);
  });

  it('should not create task for closed sprint', () => {
    fixture.componentRef.setInput('sprint', {
      ...sprint,
      is_completed: true,
    });

    fixture.detectChanges();

    component.createSprintTask();

    expect(workService.createWork).not.toHaveBeenCalled();
  });

  it('should open users load dialog', () => {
    const button = document.createElement('button');
    const span = document.createElement('span');

    button.appendChild(span);

    const event = {
      target: span,
    } as unknown as PointerEvent;

    component.viewUsersLoad(event);

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should emit update signal after sprint update', () => {
    const emitSpy = vi.fn();

    component.updateSprintsSignal.subscribe(emitSpy);

    component.updateSprint();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit update signal after delete', () => {
    const emitSpy = vi.fn();

    component.updateSprintsSignal.subscribe(emitSpy);

    component.deleteSprint();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit update signal after create task', () => {
    const emitSpy = vi.fn();

    component.updateSprintsSignal.subscribe(emitSpy);

    component.createSprintTask();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should start sprint', () => {
    const event = {
      target: document.createElement('button'),
    } as unknown as PointerEvent;

    component.changeSprintStatus(event);

    expect(sprintService.updateSprint).toHaveBeenCalled();
  });
});
