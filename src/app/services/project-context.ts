import { inject, Injectable, signal } from '@angular/core';
import { catchError, expand, map, Observable, of, reduce, tap, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../interfaces/common';
import {
  IProject,
  IProjectCategory,
  IProjectCategoryCreateOrUpdate,
  IProjectCreateOrUpdate,
  IProjectsQueryParams,
  IProjectType,
  IProjectTypeCreateOrUpdate, IProjectVersion, IProjectVersionCreateOrUpdate,
} from '../interfaces/project';


@Injectable({
  providedIn: 'root',
})
export class ProjectContextService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  // Обобщённая функция для загрузки всех страниц
  private fetchAllPages<T>(firstPageUrl: string): Observable<T[]> {
    const getPage = (url: string): Observable<PaginatedResponse<T>> =>
      this.http
        .get<PaginatedResponse<T>>(url)
        .pipe(
          catchError((err) =>
            throwError(() => new Error(`Failed to load data from ${url}: ${err.message}`)),
          ),
        );
    return getPage(firstPageUrl).pipe(
      expand((page) => (page.next ? getPage(page.next) : of())),
      reduce((acc, page) => [...acc, ...page.results], [] as T[]),
    );
  }
  private fetchCanCreate(url: string): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${url}can-create/`).pipe(
      catchError(() => {
        return of({ can_create: false });
      }),
      map((result) => result.can_create),
    );
  }
  private fetchCanEdit(url: string): Observable<boolean> {
    return this.http.get<{ can_edit: boolean }>(`${url}can-edit/`).pipe(
      catchError(() => {
        return of({ can_edit: false });
      }),
      map((result) => result.can_edit),
    );
  }
  private fetchCanView(url: string): Observable<boolean> {
    return this.http.get<{ can_view: boolean }>(`${url}can-view/`).pipe(
      catchError(() => {
        return of({ can_view: false });
      }),
      map((result) => result.can_view),
    );
  }

  // Проекты
  private projectsSignal = signal<IProject[]>([]);
  readonly projects = this.projectsSignal.asReadonly();

  getCanCreateProject(): Observable<boolean> {
    return this.fetchCanCreate(`${this.apiUrl}/projects/`);
  }
  getCanEditProject(slug: number): Observable<boolean> {
    return this.fetchCanEdit(`${this.apiUrl}/projects/${slug}/`);
  }
  getCanViewProject(slug: number): Observable<boolean> {
    return this.fetchCanView(`${this.apiUrl}/projects/${slug}/`);
  }
  getProjectsPage(data: IProjectsQueryParams): Observable<PaginatedResponse<IProject>> {
    const url = `${this.apiUrl}/projects/`;
    let params = new HttpParams().set('page', data.page).set('page_size', data.pageSize);
    if (data.search) params = params.set('search', data.search);
    if (data.ordering) params = params.set('ordering', data.ordering);
    if (data.categoryId) params = params.set('category', data.categoryId);
    if (data.typeId) params = params.set('type', data.typeId);
    if (data.managerId) params = params.set('manager', data.managerId);
    return this.http.get<PaginatedResponse<IProject>>(url, { params });
  }
  getProject(slug: string): Observable<IProject> {
    return this.http.get<IProject>(`${this.apiUrl}/projects/${slug}/`);
  }

  getAllProjects(): Observable<IProject[]> {
    const firstPageUrl = `${this.apiUrl}/projects/`;
    return this.fetchAllPages<IProject>(firstPageUrl).pipe(
      catchError(() => {
        return of([]);
      }),
      tap((projects) => this.projectsSignal.set(projects)),
    );
  }
  storageSelectProjectKey = (): string => 'selectedProjectId';
  get storageSelectedProjectId(): number | undefined {
    const numStorageProjectId = Number(localStorage.getItem(this.storageSelectProjectKey()));
    if (numStorageProjectId) {
      return numStorageProjectId;
    }
    return undefined;
  }
  selectProject(project: IProject): void {
    localStorage.setItem(this.storageSelectProjectKey(), String(project.slug));
    const current = this.projectsSignal();
    if (current[0]?.slug !== project.slug) {
      const others = current.filter((p) => p.slug !== project.slug);
      this.projectsSignal.set([project, ...others]);
    }
  }
  createProject(data: IProjectCreateOrUpdate): Observable<IProject> {
    return this.http.post<IProject>(`${this.apiUrl}/projects/`, data).pipe(
      tap((project) => {
        this.projectsSignal.update((projects) => [project, ...projects]);
      }),
    );
  }
  updateProject(slug: string, data: IProjectCreateOrUpdate): Observable<IProject> {
    return this.http.patch<IProject>(`${this.apiUrl}/projects/${slug}/`, data).pipe(
      tap((project: IProject) => {
        this.projectsSignal.update((projects) => {
          const existingProject = projects.find((p) => p.slug === project.slug);
          if (existingProject) {
            const updatedProject = { ...existingProject, ...project };
            return [updatedProject, ...projects.filter((p) => p.slug !== project.slug)];
          }
          return [project, ...projects];
        });
      }),
    );
  }
  deleteProject(slug: string): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/projects/${slug}/`).pipe(
      tap(() => {
        this.projectsSignal.update((projects) => projects.filter((p) => p.slug !== slug));
      }),
    );
  }

  // Категории проектов
  private projectCategoriesSignal = signal<IProjectCategory[]>([]);
  readonly projectCategories = this.projectCategoriesSignal.asReadonly();

  getCanCreateProjectCategory(): Observable<boolean> {
    return this.fetchCanCreate(`${this.apiUrl}/project-categories/`);
  }
  getCanEditProjectCategory(projectCategoryId: number): Observable<boolean> {
    return this.fetchCanEdit(`${this.apiUrl}/project-categories/${projectCategoryId}/`);
  }
  getCanViewProjectCategory(projectCategoryId: number): Observable<boolean> {
    return this.fetchCanView(`${this.apiUrl}/project-categories/${projectCategoryId}/`);
  }
  getProjectCategoriesPage(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginatedResponse<IProjectCategory>> {
    const url = `${this.apiUrl}/project-categories/?page=${page}&page_size=${pageSize}`;
    return this.http.get<PaginatedResponse<IProjectCategory>>(url);
  }

  getAllProjectCategories(): Observable<IProjectCategory[]> {
    const firstPageUrl = `${this.apiUrl}/project-categories/`;
    return this.fetchAllPages<IProjectCategory>(firstPageUrl).pipe(
      catchError(() => {
        return of([]);
      }),
      tap((projectCategories) => this.projectCategoriesSignal.set(projectCategories)),
    );
  }
  createProjectCategory(data: IProjectCategoryCreateOrUpdate): Observable<IProjectCategory> {
    return this.http.post<IProjectCategory>(`${this.apiUrl}/project-categories/`, data);
  }
  updateProjectCategory(
    projectCategoryId: number,
    data: IProjectCategoryCreateOrUpdate,
  ): Observable<IProjectCategory> {
    return this.http.patch<IProjectCategory>(
      `${this.apiUrl}/project-categories/${projectCategoryId}/`,
      data,
    );
  }
  deleteProjectCategory(projectCategoryId: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/project-categories/${projectCategoryId}/`);
  }

  async loadAllProjectCategories(): Promise<void> {
    try {
      const categories = await this.getAllProjectCategories().toPromise();
      if (categories) this.projectCategoriesSignal.set(categories);
    } catch (err) {
      console.error('Failed to load project categories', err);
      throw err;
    }
  }

  // Типы проектов
  private projectTypesSignal = signal<IProjectType[]>([]);
  readonly projectTypes = this.projectTypesSignal.asReadonly();

  getCanCreateProjectType(): Observable<boolean> {
    return this.fetchCanCreate(`${this.apiUrl}/project-types/`);
  }
  getCanEditProjectType(projectTypeId: number): Observable<boolean> {
    return this.fetchCanEdit(`${this.apiUrl}/project-types/${projectTypeId}/`);
  }
  getCanViewProjectType(projectTypeId: number): Observable<boolean> {
    return this.fetchCanView(`${this.apiUrl}/project-types/${projectTypeId}/`);
  }
  getProjectTypesPage(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginatedResponse<IProjectType>> {
    const url = `${this.apiUrl}/project-types/?page=${page}&page_size=${pageSize}`;
    return this.http.get<PaginatedResponse<IProjectType>>(url);
  }

  getAllProjectTypes(): Observable<IProjectType[]> {
    const firstPageUrl = `${this.apiUrl}/project-types/`;
    return this.fetchAllPages<IProjectType>(firstPageUrl).pipe(
      catchError(() => {
        return of([]);
      }),
      tap((projectTypes) => this.projectTypesSignal.set(projectTypes)),
    );
  }
  createProjectType(data: IProjectTypeCreateOrUpdate): Observable<IProjectType> {
    return this.http.post<IProjectType>(`${this.apiUrl}/project-types/`, data);
  }
  updateProjectType(
    projectTypeId: number,
    data: IProjectTypeCreateOrUpdate,
  ): Observable<IProjectType> {
    return this.http.patch<IProjectType>(`${this.apiUrl}/project-types/${projectTypeId}/`, data);
  }
  deleteProjectType(projectTypeId: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/project-types/${projectTypeId}/`);
  }

  async loadAllProjectTypes(): Promise<void> {
    try {
      const types = await this.getAllProjectTypes().toPromise();
      if (types) this.projectTypesSignal.set(types);
    } catch (err) {
      console.error('Failed to load project types', err);
      throw err;
    }
  }

  // Версии проекта
  createProjectVersion(data: IProjectVersionCreateOrUpdate): Observable<IProjectVersion> {
    return this.http.post<IProjectVersion>(`${this.apiUrl}/project-versions/`, data);
  }
}
