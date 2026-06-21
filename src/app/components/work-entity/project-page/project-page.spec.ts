import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ProjectPageComponent } from './project-page';

import { UserService } from '../../../services/user';
import { WorkService } from '../../../services/work';
import { ProjectContextService } from '../../../services/project-context';
import { StatusesService } from '../../../services/work-references';

describe('ProjectPageComponent', () => {
  let component: ProjectPageComponent;
  let fixture: ComponentFixture<ProjectPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPageComponent],
      providers: [
        provideRouter([]),

        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ slug: 'test-project' }),
            snapshot: {
              params: {
                slug: 'test-project',
              },
            },
          },
        },

        {
          provide: MatDialog,
          useValue: {
            open: () => ({
              afterClosed: () => of(null),
            }),
          },
        },

        {
          provide: UserService,
          useValue: {
            user: () => ({ id: 1 }),
            getUsers: () =>
              of({
                results: [],
                count: 0,
              }),
          },
        },

        {
          provide: StatusesService,
          useValue: {
            getList: () =>
              of({
                results: [],
                count: 0,
              }),
          },
        },

        {
          provide: WorkService,
          useValue: {
            getCanCreateTask: () => of(true),
            createWork: () => of({}),
            getWorkPage: () =>
              of({
                results: [],
                count: 0,
                next: null,
                previous: null,
              }),
          },
        },

        {
          provide: ProjectContextService,
          useValue: {
            getCanEditProject: () => of(true),

            getProject: () =>
              of({
                id: 1,
                slug: 'test-project',
                name: 'Test Project',
                versions: [],
              }),

            getAllProjectTypes: () => of([]),
            getAllProjectCategories: () => of([]),

            updateProject: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
