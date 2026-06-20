import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TaskViewComponent } from './task-view';
import {
  WorkDifficultiesService,
  WorkPrioritiesService,
  WorkTagsService,
  WorkTechnologiesService,
  WorkTypesService,
} from '../../../../services/work-references';
import { MatDialog } from '@angular/material/dialog';
import { SprintService } from '../../../../services/sprint';
import { UserService } from '../../../../services/user';
import { WorkConnectionService } from '../../../../services/work-connection';
import { WorkCommentService } from '../../../../services/work-comment';
import { WorkService } from '../../../../services/work';
import { signal } from '@angular/core';

describe('TaskViewComponent', () => {
  let component: TaskViewComponent;
  let fixture: ComponentFixture<TaskViewComponent>;

  const mockWork = {
    id: 1,
    name: 'Test task',
    slug: 'TASK-1',
    full_name: 'TASK-1 Test task',
    color: '#fff',
    icon: '',
    description: 'description',
    created: '2025-01-01',
    updated: '2025-01-02',
    project: {
      id: 1,
      name: 'Project',
      slug: 'project',
      icon: '',
      code_prefix: 'PRJ',
    },
    status: {
      id: 1,
      name: 'Open',
      slug: 'open',
      color: '#000',
      icon: '',
    },
    created_by: {
      id: 1,
      full_name: 'Admin',
      profile_photo: '',
    },
  } as any;

  const workServiceMock = {
    getCanCreateTask: vi.fn().mockReturnValue(of(true)),
    getCanEdit: vi.fn().mockReturnValue(of(true)),
    getWork: vi.fn().mockReturnValue(of(mockWork)),
    getWorkPage: vi.fn().mockReturnValue(of({ results: [], next: null })),
    patchWork: vi.fn(),
    updateWork: vi.fn(),
    createWork: vi.fn(),
  };

  const workCommentServiceMock = {
    getCanCreate: vi.fn().mockReturnValue(of(true)),
    getCommentsPage: vi.fn().mockReturnValue(of({ results: [], next: null, count: 0 })),
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  const workConnectionServiceMock = {
    getList: vi.fn().mockReturnValue(of([])),
    create: vi.fn(),
    delete: vi.fn(),
  };

  const userServiceMock = {
    user: signal({ id: 1, full_name: 'Test User' }),
    getUsers: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const workTypesServiceMock = {
    getList: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const prioritiesServiceMock = {
    getList: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const sprintServiceMock = {
    getSprintPage: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const tagsServiceMock = {
    getList: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const difficultiesServiceMock = {
    getList: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const technologiesServiceMock = {
    getList: vi.fn().mockReturnValue(of({ results: [], next: null })),
  };

  const dialogMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskViewComponent],
      providers: [
        provideRouter([]),

        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(
              convertToParamMap({
                slug: 'TASK-1',
              }),
            ),
          },
        },

        { provide: MatDialog, useValue: dialogMock },

        { provide: WorkService, useValue: workServiceMock },
        { provide: WorkCommentService, useValue: workCommentServiceMock },
        { provide: WorkConnectionService, useValue: workConnectionServiceMock },

        { provide: UserService, useValue: userServiceMock },

        { provide: WorkTypesService, useValue: workTypesServiceMock },
        { provide: WorkPrioritiesService, useValue: prioritiesServiceMock },
        { provide: SprintService, useValue: sprintServiceMock },
        { provide: WorkTagsService, useValue: tagsServiceMock },
        { provide: WorkDifficultiesService, useValue: difficultiesServiceMock },
        { provide: WorkTechnologiesService, useValue: technologiesServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskViewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load slug from route', () => {
    expect(component.taskSlug).toBe('TASK-1');
  });

  it('should load task', () => {
    expect(component.task()).toEqual(mockWork);
  });

  it('should load edit permission', () => {
    expect(component.canEdit()).toBe(true);
  });

  it('should load create task permission', () => {
    expect(component.canCreateTask()).toBe(true);
  });

  it('should clear error signal', () => {
    component.errorSignal.set('test error');

    expect(component.error()).toBe('test error');

    component.errorSignal.set('');

    expect(component.error()).toBe('');
  });
});
