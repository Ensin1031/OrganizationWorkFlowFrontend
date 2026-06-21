import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ActiveTasksBoardComponent } from './active-tasks-board';
import { SprintService } from '../../../../services/sprint';
import { WorkService } from '../../../../services/work';
import { StatusesService } from '../../../../services/work-references';

describe('ActiveTasksBoardComponent', () => {
  let component: ActiveTasksBoardComponent;
  let fixture: ComponentFixture<ActiveTasksBoardComponent>;

  let sprintService: any;
  let workService: any;
  let statusesService: any;
  let router: any;

  const sprint1 = {
    slug: 'sprint-1',
    name: 'Sprint 1',
  };

  const sprint2 = {
    slug: 'sprint-2',
    name: 'Sprint 2',
  };

  const user1 = {
    id: 1,
    full_name: 'Alex',
  };

  const user2 = {
    id: 2,
    full_name: 'John',
  };

  const statusTodo = {
    id: 10,
    status: 1,
    priority: 1,
    name: 'Todo',
    color: '#111',
    project_id: 100,
  };

  const statusDone = {
    id: 20,
    status: 2,
    priority: 2,
    name: 'Done',
    color: '#222',
    project_id: 100,
  };

  const task1: any = {
    id: 1,
    slug: 'TASK-1',
    name: 'Task 1',
    project: {
      id: 100,
    },
    execute_by: user1,
    status: {
      status: 1,
    },
  };

  const task2: any = {
    id: 2,
    slug: 'TASK-2',
    name: 'Task 2',
    project: {
      id: 100,
    },
    execute_by: user2,
    status: {
      status: 2,
    },
  };

  beforeEach(async () => {
    sprintService = {
      getActiveSprints: vi.fn(() => of([sprint1, sprint2])),
    };

    workService = {
      getBySprints: vi.fn(() => of([task1, task2])),
      patchWork: vi.fn(() => of(task1)),
    };

    statusesService = {
      getBySprints: vi.fn(() => of([statusTodo, statusDone])),
    };

    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ActiveTasksBoardComponent],
      providers: [
        { provide: SprintService, useValue: sprintService },
        { provide: WorkService, useValue: workService },
        { provide: StatusesService, useValue: statusesService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({}),
            paramMap: of(new Map()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveTasksBoardComponent);
    component = fixture.componentInstance;

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

  it('should load active sprints', () => {
    expect(component.activeSprints().length).toBe(2);
    expect(component.activeSprintSlugs()).toEqual(['sprint-1', 'sprint-2']);
  });

  it('should return sprintSlugs from active sprints when selectedSprintSlugs is null', () => {
    component.selectedSprintSlugs.set(null);

    expect(component.sprintSlugs()).toEqual(['sprint-1', 'sprint-2']);
  });

  it('should return selected sprint slugs', () => {
    component.selectedSprintSlugs.set(['sprint-1']);

    expect(component.sprintSlugs()).toEqual(['sprint-1']);
  });

  it('should load tasks', () => {
    expect(component.tasks().length).toBe(2);
  });

  it('should build unique sorted users list', () => {
    const users = component.taskUsers();

    expect(users.length).toBe(2);
    expect(users[0].full_name).toBe('Alex');
    expect(users[1].full_name).toBe('John');
  });

  it('should build statuses list', () => {
    const statuses = component.statuses();

    expect(statuses.length).toBe(2);
    expect(statuses[0].status).toBe(1);
    expect(statuses[1].status).toBe(2);
  });

  it('should filter tasks by user and status', () => {
    const tasks = component.tasksByUserAndStatus(1, 1);

    expect(tasks.length).toBe(1);
    expect(tasks[0].slug).toBe('TASK-1');
  });

  it('should return tasks without executor', () => {
    const taskWithoutUser = {
      ...task1,
      execute_by: null,
    };

    component.boardDataResource.set({
      tasks: [taskWithoutUser],
      statuses: [statusTodo],
    } as any);

    const result = component.tasksByUserAndStatus(1);

    expect(result.length).toBe(1);
  });

  it('should navigate to sprint', () => {
    component.goToSprint(sprint1 as any);

    expect(router.navigate).toHaveBeenCalledWith(['/home', 'sprints', 'sprint-1']);
  });

  it('should toggle task list in localStorage', () => {
    expect(component.isTaskListOpen(user1 as any)).toBe(false);

    component.viewTasks(user1 as any);

    expect(component.isTaskListOpen(user1 as any)).toBe(true);

    component.viewTasks(user1 as any);

    expect(component.isTaskListOpen(user1 as any)).toBe(false);
  });

  it('should generate dropListId', () => {
    expect(component.dropListId(5, 10)).toBe('drop-5-10');
  });

  it('should return connected drop lists', () => {
    const result = component.connectedDropLists(1);

    expect(result).toEqual(['drop-1-1', 'drop-1-2']);
  });

  it('should allow drop when project is available in status', () => {
    const drag: any = {
      data: {
        project: {
          id: 100,
        },
      },
    };

    const drop: any = {
      id: 'drop-1-1',
    };

    expect(component.canDropTask(drag, drop)).toBe(true);
  });

  it('should deny drop when status not found', () => {
    const drag: any = {
      data: {
        project: {
          id: 100,
        },
      },
    };

    const drop: any = {
      id: 'drop-1-999',
    };

    expect(component.canDropTask(drag, drop)).toBe(false);
  });

  it('should move task inside same column', () => {
    const firstTask = {
      id: 1,
      project: {
        id: 100,
      },
    } as any;

    const secondTask = {
      id: 2,
      project: {
        id: 100,
      },
    } as any;

    const data = [firstTask, secondTask];

    const event: any = {
      previousContainer: { data },
      container: { data },
      previousIndex: 0,
      currentIndex: 1,
      item: {
        data: firstTask,
      },
    };

    component.dropTask(event, 1, statusTodo as any);

    expect(data[0]).toBe(secondTask);
    expect(data[1]).toBe(firstTask);
  });

  it('should patch task status after move', () => {
    const event: any = {
      previousContainer: {
        data: [task1],
      },
      container: {
        data: [],
      },
      previousIndex: 0,
      currentIndex: 0,
      item: {
        data: task1,
      },
    };

    component.dropTask(event, 1, statusDone as any);

    expect(workService.patchWork).toHaveBeenCalledWith('TASK-1', {
      status_id: 20,
    });
  });

  it('should set backend validation errors', () => {
    workService.patchWork.mockReturnValue(
      throwError(() => ({
        error: {
          field: ['error1', 'error2'],
        },
      })),
    );

    const event: any = {
      previousContainer: {
        data: [task1],
      },
      container: {
        data: [],
      },
      previousIndex: 0,
      currentIndex: 0,
      item: {
        data: task1,
      },
    };

    component.dropTask(event, 1, statusDone as any);

    expect(component.error()).toContain('error1');
    expect(component.error()).toContain('error2');
  });

  it('should set generic error message', () => {
    workService.patchWork.mockReturnValue(
      throwError(() => ({
        error: null,
      })),
    );

    const event: any = {
      previousContainer: {
        data: [task1],
      },
      container: {
        data: [],
      },
      previousIndex: 0,
      currentIndex: 0,
      item: {
        data: task1,
      },
    };

    component.dropTask(event, 1, statusDone as any);

    expect(component.error()).toBe('Произошла ошибка');
  });

  it('should refresh data', async () => {
    component.refresh();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(sprintService.getActiveSprints).toHaveBeenCalled();
  });
});
