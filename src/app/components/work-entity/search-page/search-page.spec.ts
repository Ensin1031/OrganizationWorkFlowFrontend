import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { SearchPageComponent } from './search-page';
import { GlobalSearchService } from '../../../services/global-search';
import { IProjectShort } from '../../../interfaces/project';
import { ISprintShort } from '../../../interfaces/sprints';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  let searchService: any;
  let router: any;

  const queryParams$ = new BehaviorSubject({});

  const project: IProjectShort = {
    active_version: undefined,
    code_prefix: "",
    color: "",
    end_date: '',
    full_name: "",
    icon: "",
    start_date: '',
    statuses: [],
    versions: [],
    id: 1,
    name: 'Project 1',
    slug: 'project-1'
  };

  const sprint: ISprintShort = {
    color: "",
    end_date: undefined,
    in_work: false,
    is_completed: false,
    start_date: undefined,
    id: 2,
    name: 'Sprint 1',
    slug: 'sprint-1'
  };

  const task = {
    id: 3,
    name: 'Task 1',
    slug: 'TASK-1',
  };

  beforeEach(async () => {
    searchService = {
      getData: vi.fn(() =>
        of({
          projects: {
            count: 1,
            results: [project],
          },
          sprints: {
            count: 1,
            results: [sprint],
          },
          epiks: {
            count: 1,
            results: [task],
          },
          histories: {
            count: 1,
            results: [task],
          },
          tasks: {
            count: 1,
            results: [task],
          },
        }),
      ),
    };

    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        {
          provide: GlobalSearchService,
          useValue: searchService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
            queryParams: queryParams$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty filters', () => {
    expect(component.globalFilters()).toEqual({});
  });

  it('should read search text from query params', () => {
    queryParams$.next({
      search: 'test',
    });

    fixture.detectChanges();

    expect(component.searchText()).toBe('test');
  });

  it('should navigate when search text changed', () => {
    component.searchText.set('hello');

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        search: 'hello',
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  it('should return default page size', () => {
    localStorage.removeItem('tasks.search.viewPageSize');

    const cmp = fixture.componentInstance;

    expect(cmp.pageSize()).toBe(100);
  });

  it('should restore page size from localStorage', async () => {
    localStorage.setItem('tasks.search.viewPageSize', '50');

    const newFixture = TestBed.createComponent(SearchPageComponent);
    const newComponent = newFixture.componentInstance;

    newFixture.detectChanges();

    expect(newComponent.pageSize()).toBe(50);
  });

  it('should change page size', () => {
    component.setTasksPageSize(200);

    expect(component.pageSize()).toBe(200);

    expect(localStorage.getItem('tasks.search.viewPageSize')).toBe('200');
  });

  it('should load search results', () => {
    component.projects.set({
      count: 1,
      results: [project],
    } as any);

    component.sprints.set({
      count: 1,
      results: [sprint],
    } as any);

    expect(component.projects()?.count).toBe(1);
    expect(component.sprints()?.count).toBe(1);
  });

  it('should return results array', () => {
    const data = {
      count: 1,
      results: [project],
    };

    expect(component.getDataResults(data as any)).toEqual([project]);
  });

  it('should build project url', () => {
    expect(component.getItemPageUrl(project as any, 'project')).toEqual(['/home/tasks']);
  });

  it('should build sprint url', () => {
    expect(component.getItemPageUrl(sprint as any, 'sprint')).toEqual([
      '/home/sprints',
      'sprint-1',
    ]);
  });

  it('should build epik url', () => {
    expect(component.getItemPageUrl(task as any, 'epik')).toEqual(['/home/tasks', 'TASK-1']);
  });

  it('should build history url', () => {
    expect(component.getItemPageUrl(task as any, 'history')).toEqual(['/home/tasks', 'TASK-1']);
  });

  it('should build task url', () => {
    expect(component.getItemPageUrl(task as any, 'task')).toEqual(['/home/tasks', 'TASK-1']);
  });

  it('should return fallback url', () => {
    expect(component.getItemPageUrl(task as any, 'unknown')).toEqual(['/home/dashboard']);
  });

  it('should return project query params', () => {
    expect(component.getItemPageUrlQueryParams(project as any, 'project')).toEqual({
      projectId: 1,
    });
  });

  it('should return empty query params for sprint', () => {
    expect(component.getItemPageUrlQueryParams(sprint as any, 'sprint')).toEqual({});
  });

  it('should return empty query params for task', () => {
    expect(component.getItemPageUrlQueryParams(task as any, 'task')).toEqual({});
  });

  it('should return project name', () => {
    expect(
      component.getSearchItemLinkName(
        {
          name: 'Project Name',
        } as any,
        'project',
      ),
    ).toBe('Project Name');
  });

  it('should return full name when exists', () => {
    expect(
      component.getSearchItemLinkName(
        {
          full_name: 'John Doe',
        } as any,
        'task',
      ),
    ).toBe('John Doe');
  });

  it('should toggle projects view', () => {
    expect(component.projectsView()).toBe(false);

    component.projectsView.set(true);

    expect(component.projectsView()).toBe(true);
  });

  it('should toggle sprints view', () => {
    expect(component.sprintsView()).toBe(false);

    component.sprintsView.set(true);

    expect(component.sprintsView()).toBe(true);
  });

  it('should toggle epiks view', () => {
    expect(component.epiksView()).toBe(false);

    component.epiksView.set(true);

    expect(component.epiksView()).toBe(true);
  });

  it('should toggle histories view', () => {
    expect(component.historiesView()).toBe(false);

    component.historiesView.set(true);

    expect(component.historiesView()).toBe(true);
  });

  it('should toggle tasks view', () => {
    expect(component.tasksView()).toBe(false);

    component.tasksView.set(true);

    expect(component.tasksView()).toBe(true);
  });
});
