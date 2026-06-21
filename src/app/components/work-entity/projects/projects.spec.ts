import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectContextService } from '../../../services/project-context';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';


const mockProjects = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      slug: 'project-1',
      name: 'Проект A',
      code_prefix: 'PA',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      manage_by: { full_name: 'Иван Иванов', username: 'i.ivanov' },
      category: { id: 1, name: 'Категория 1', icon: null, has_projects: true },
      type: { id: 1, name: 'Тип 1', icon: null, has_projects: true },
      urls: ['https://example.com'],
      active_version: { name: 'v1.0' },
      description: 'Описание проекта A',
      icon: null,
      versions: [],
    },
    {
      id: 2,
      slug: 'project-2',
      name: 'Проект B',
      code_prefix: 'PB',
      start_date: '2025-02-01',
      end_date: '2025-11-30',
      manage_by: { full_name: 'Петр Петров', username: 'p.petrov' },
      category: { id: 2, name: 'Категория 2', icon: null, has_projects: true },
      type: { id: 2, name: 'Тип 2', icon: null, has_projects: true },
      urls: [],
      active_version: { name: 'v2.0' },
      description: 'Описание проекта B',
      icon: null,
      versions: [],
    },
  ],
};

const mockTypes = [
  { id: 1, name: 'Тип 1', has_projects: true, selected: false, icon: null },
  { id: 2, name: 'Тип 2', has_projects: false, selected: false, icon: null },
];

const mockCategories = [
  { id: 1, name: 'Категория 1', has_projects: true, selected: false, icon: null },
  { id: 2, name: 'Категория 2', has_projects: false, selected: false, icon: null },
];

function createManualSpy<T extends (...args: any[]) => any>(fn: T) {
  let calls = 0;
  const wrapper = (...args: Parameters<T>) => {
    calls++;
    return fn(...args);
  };
  wrapper.calls = () => calls;
  wrapper.reset = () => {
    calls = 0;
  };
  wrapper.fn = fn;
  return wrapper;
}

const projectContextServiceMock = {
  getProjectsPage: createManualSpy(() => of(mockProjects)),
  getAllProjectTypes: createManualSpy(() => of(mockTypes)),
  getAllProjectCategories: createManualSpy(() => of(mockCategories)),
  getCanCreateProject: createManualSpy(() => of(true)),
  getCanCreateProjectType: createManualSpy(() => of(true)),
  getCanCreateProjectCategory: createManualSpy(() => of(true)),
  createProject: createManualSpy(() => of({})),
  updateProject: createManualSpy(() => of({})),
  createProjectType: createManualSpy(() => of({})),
  updateProjectType: createManualSpy(() => of({})),
  deleteProjectType: createManualSpy(() => of({})),
  createProjectCategory: createManualSpy(() => of({})),
  updateProjectCategory: createManualSpy(() => of({})),
  deleteProjectCategory: createManualSpy(() => of({})),
  selectProject: createManualSpy(() => {}),
};

const activatedRouteMock = {
  snapshot: { queryParams: {} },
  queryParams: of({}),
};

const routerMock = {
  navigate: createManualSpy(() => Promise.resolve(true)),
};

const dialogMock = {
  open: createManualSpy(() => ({
    afterClosed: createManualSpy(() => of(null)),
  })),
};

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    Object.values(projectContextServiceMock).forEach((m) => m.reset?.());
    routerMock.navigate.reset();
    dialogMock.open.reset();
    (projectContextServiceMock.getProjectsPage as any).fn = () => of(mockProjects);
    (projectContextServiceMock.getAllProjectTypes as any).fn = () => of(mockTypes);
    (projectContextServiceMock.getAllProjectCategories as any).fn = () => of(mockCategories);
    (projectContextServiceMock.getCanCreateProject as any).fn = () => of(true);
    (projectContextServiceMock.getCanCreateProjectType as any).fn = () => of(true);
    (projectContextServiceMock.getCanCreateProjectCategory as any).fn = () => of(true);
    (projectContextServiceMock.createProject as any).fn = () => of({});
    (projectContextServiceMock.updateProject as any).fn = () => of({});
    (projectContextServiceMock.createProjectType as any).fn = () => of({});
    (projectContextServiceMock.updateProjectType as any).fn = () => of({});
    (projectContextServiceMock.deleteProjectType as any).fn = () => of({});
    (projectContextServiceMock.createProjectCategory as any).fn = () => of({});
    (projectContextServiceMock.updateProjectCategory as any).fn = () => of({});
    (projectContextServiceMock.deleteProjectCategory as any).fn = () => of({});
    (projectContextServiceMock.selectProject as any).fn = () => {};
    (routerMock.navigate as any).fn = () => Promise.resolve(true);
    (dialogMock.open as any).fn = () => ({
      afterClosed: createManualSpy(() => of(null)),
    });

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectContextService, useValue: projectContextServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a list of projects in the table', async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();

    expect(projectContextServiceMock.getProjectsPage.calls()).toBeGreaterThan(0);

    const rows = debugElement.queryAll(By.css('table tbody tr'));
    expect(rows.length).toBe(2);

    const nameCell = rows[0].query(By.css('td a'));
    expect(nameCell.nativeElement.textContent.trim()).toContain('Проект A');

    const codePrefixCell = rows[0].queryAll(By.css('td'))[1];
    expect(codePrefixCell.nativeElement.textContent.trim()).toBe('PA');

  });

  it('should update searchText on input', () => {
    const searchInput = debugElement.query(By.css('input[placeholder="Введите название или код"]'));
    const inputElement = searchInput.nativeElement;
    inputElement.value = 'Проект A';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.searchText()).toBe('Проект A');
  });

  it('should change page and pageSize on page event', () => {
    const pageEvent = { pageIndex: 2, pageSize: 50, length: 100 };
    component.onPageChange(pageEvent);
    expect(component.currentPage()).toBe(3);
    expect(component.pageSize()).toBe(50);
  });

  it('should display paginator with correct length', async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();

    expect(projectContextServiceMock.getProjectsPage.calls()).toBeGreaterThan(0);

    const paginator = debugElement.query(By.css('mat-paginator'));
    expect(paginator).toBeTruthy();
    const componentInstance = paginator.componentInstance;
    expect(componentInstance.length).toBe(mockProjects.count);
    expect(componentInstance.pageSize).toBe(20);
  });

});
