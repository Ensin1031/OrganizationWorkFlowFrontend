import { Component, computed, effect, HostBinding, inject, signal } from '@angular/core';
import { MatDivider } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectContextService } from '../../../services/project-context';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  IProject,
  IProjectCategory, IProjectCreateOrUpdate,
  IProjectsQueryParams,
  IProjectType,
} from '../../../interfaces/project';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import {
  CreateUpdateProjectMatObjectDialogComponent,
  IProjectMatObjectDialogData,
} from '../../dialogs/create-update-category/create-update-category';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent, ISetDialogData } from '../../dialogs/confirmation/confirmation';
import { AlertComponent } from '../../dialogs/alert/alert';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  CreateUpdateProjectDialogComponent,
  IProjectCreateUpdateDialogData,
} from '../../dialogs/create-update-project/create-update-project';
import { HttpErrorResponse } from '@angular/common/http';

type ProjectComponentQueryParams = {
  projectCategoryId?: string;
  projectTypeId?: string;
  search?: string;
  page?: string;
  pageSize?: string;
  ordering?: string;
};


@Component({
  selector: 'app-projects',
  imports: [
    MatDivider,
    FormsModule,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    SafeSvgComponent,
    MatTooltip,
    NgClass,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatPaginator,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    DatePipe,
    SlicePipe,
    MatButton,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected projectService = inject(ProjectContextService);
  private dialog = inject(MatDialog);

  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());

  private reloadProjectsTrigger = signal(0);
  private reloadProjectTypesTrigger = signal(0);
  private reloadProjectCategoriesTrigger = signal(0);

  selectedProjectCategoryId = signal<number | null>(null);
  selectedProjectTypeId = signal<number | null>(null);

  private queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams as ProjectComponentQueryParams,
  });

  // URL -> STATE
  private syncFromUrl = effect(() => {
    const params = this.queryParams();
    this.searchText.set(params.search ?? '');
    this.selectedProjectCategoryId.set(params.projectCategoryId ? +params.projectCategoryId : null);
    this.selectedProjectTypeId.set(params.projectTypeId ? +params.projectTypeId : null);
    this.currentPage.set(params.page ? +params.page : 1);
    this.pageSize.set(params.pageSize ? +params.pageSize : 20);
    if (params.ordering) {
      const ordering = params.ordering as string;
      if (ordering.startsWith('-')) {
        this.sortDirection.set('desc');
        this.sortField.set(ordering.substring(1));
      } else {
        this.sortDirection.set('asc');
        this.sortField.set(ordering);
      }
    } else {
      this.sortDirection.set(null);
      this.sortField.set('');
    }
  });
  // STATE -> URL
  private syncToUrl = effect(() => {
    const params = this.queryParams();

    const next: ProjectComponentQueryParams = {
      search: this.searchText() || undefined,
      projectCategoryId: !!this.selectedProjectCategoryId()
        ? String(this.selectedProjectCategoryId())
        : undefined,
      projectTypeId: !!this.selectedProjectTypeId()
        ? String(this.selectedProjectTypeId())
        : undefined,
      page: !!this.currentPage() ? String(this.currentPage()) : undefined,
      pageSize: !!this.pageSize() ? String(this.pageSize()) : undefined,
      ordering: !!this.ordering() ? String(this.ordering()) : undefined,
    };

    const isSame =
      (params.search ?? null) === next.search &&
      (params.projectCategoryId ?? null) === (next.projectCategoryId?.toString() ?? null) &&
      (params.projectTypeId ?? null) === (next.projectTypeId?.toString() ?? null) &&
      (params.page ?? null) === (next.page?.toString() ?? null) &&
      (params.pageSize ?? null) === (next.pageSize?.toString() ?? null) &&
      (params.ordering ?? null) === (next.ordering?.toString() ?? null);

    if (isSame) return;

    if ((params.projectCategoryId ?? null) !== (next.projectCategoryId?.toString() ?? null)) {
      this.projectCategories()().forEach((category) => {
        category.selected = category.id === this.selectedProjectCategoryId();
      });
    }
    if ((params.projectTypeId ?? null) !== (next.projectTypeId?.toString() ?? null)) {
      this.projectTypes()().forEach((type) => {
        type.selected = type.id === this.selectedProjectTypeId();
      });
    }

    this.router.navigate([], {
      queryParams: next,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  // Получение разрешений с бэка при инициализации компонента
  private permissions = toSignal(
    forkJoin({
      canCreateProject: this.projectService.getCanCreateProject(),
      canCreateProjectType: this.projectService.getCanCreateProjectType(),
      canCreateProjectCategory: this.projectService.getCanCreateProjectCategory(),
    }),
    {
      initialValue: {
        canCreateProject: false,
        canCreateProjectType: false,
        canCreateProjectCategory: false,
      },
    },
  );
  canCreateProject = computed(() => this.permissions().canCreateProject);
  canCreateProjectType = computed(() => this.permissions().canCreateProjectType);
  canCreateProjectCategory = computed(() => this.permissions().canCreateProjectCategory);

  projectTypes$ = toSignal(
    toObservable(this.reloadProjectTypesTrigger).pipe(
      switchMap(() => this.projectService.getAllProjectTypes()),
    ),
    { initialValue: [] },
  );
  projectTypes = computed(() => this.projectTypes$);

  projectCategories$ = toSignal(
    toObservable(this.reloadProjectCategoriesTrigger).pipe(
      switchMap(() => this.projectService.getAllProjectCategories()),
    ),
    { initialValue: [] },
  );
  projectCategories = computed(() => this.projectCategories$);

  private baseColumns: string[] = [
    'name',
    'code_prefix',
    'start_date',
    'end_date',
    'versions',
    'manage_by',
    'category',
    'type',
    'urls',
    'description',
  ];
  displayedColumns = computed(() => {
    const cols = [...this.baseColumns];
    if (this.permissions().canCreateProject) {
      cols.push('manageCol');
    }
    return cols;
  });

  searchText = signal('');
  currentPage = signal(1);
  pageSize = signal(20);
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc' | null>('asc');
  private ordering = computed(() => {
    if (!this.sortField() || !this.sortDirection()) return null;
    const prefix = this.sortDirection() === 'desc' ? '-' : '';
    return `${prefix}${this.sortField()}`;
  });
  private getProjectsParams = computed<IProjectsQueryParams>(() => ({
    reload: this.reloadProjectsTrigger(),
    page: this.currentPage(),
    pageSize: this.pageSize(),
    search: this.searchText() || null,
    ordering: this.ordering(),
    categoryId: this.selectedProjectCategoryId(),
    typeId: this.selectedProjectTypeId(),
    managerId: null,
  }));
  private projectsResponse = toSignal(
    toObservable(this.getProjectsParams).pipe(
      debounceTime(300),
      switchMap((params) => this.projectService.getProjectsPage(params)),
    ),
    { initialValue: { count: 0, next: null, previous: null, results: [] as IProject[] } },
  );

  projects = computed(() => this.projectsResponse());
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
  }
  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortField.set('name');
      this.sortDirection.set(null);
    } else {
      this.sortField.set(sort.active);
      this.sortDirection.set(sort.direction as 'asc' | 'desc');
    }
  }
  goToProjectTacks(project: IProject): void {
    this.projectService.selectProject(project);
    this.searchText.set('');
    this.router.navigate(['/home/projects', project.slug]);
  }
  createProject(event: PointerEvent): void {
    if (!this.canCreateProject()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    const dialogData: IProjectCreateUpdateDialogData = {
      mode: 'create',
      availableVersions: [],
      availableCategories: this.projectCategories()(),
      availableTypes: this.projectTypes()(),
    };
    this.dialog
      .open(CreateUpdateProjectDialogComponent, {
        width: '700px',
        data: dialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProject) =>
          this.projectService.createProject(result as IProjectCreateOrUpdate),
        ),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadPageData()),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  updateProject(event: PointerEvent, project: IProject): void {
    if (!this.canCreateProject()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    const dialogData: IProjectCreateUpdateDialogData = {
      mode: 'edit',
      project: project,
      availableVersions: project.versions,
      availableCategories: this.projectCategories()(),
      availableTypes: this.projectTypes()(),
    };
    this.dialog
      .open(CreateUpdateProjectDialogComponent, {
        width: '700px',
        data: dialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProject) =>
          this.projectService.updateProject(project.slug, result as IProjectCreateOrUpdate),
        ),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadPageData()),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  private reloadPageData(): void {
    this.currentPage.set(1);
    this.pageSize.set(20);
    this.searchText.set('');
    this.selectedProjectCategoryId.set(null);
    this.selectedProjectTypeId.set(null);
    this.reloadProjectsTrigger.update((v) => v + 1);
    this.reloadProjectTypesTrigger.update((v) => v + 1);
    this.reloadProjectCategoriesTrigger.update((v) => v + 1);
    // this.reloadWorkStatusesTrigger.update((v) => v + 1);
  }

  searchProjectTypeText = signal('');
  filteredProjectTypes = computed(() => {
    const projectTypes = this.projectTypes();
    if (this.selectedProjectTypeId()) {
      projectTypes().forEach((type) => {
        type.selected = type.id === this.selectedProjectTypeId();
      });
    }
    const query = this.searchProjectTypeText().trim().toLowerCase();
    if (!query) return projectTypes();
    return projectTypes().filter((p) => p.name.toLowerCase().includes(query));
  });
  onSelectProjectType(projectType: IProjectType, withClean: boolean = false): void {
    projectType.selected = true;
    this.selectedProjectTypeId.set(projectType.id);
    if (withClean) {
      this.searchText.set('');
      this.selectedProjectCategoryId.set(null);
      this.currentPage.set(1);
      this.pageSize.set(20);
    }
  }
  onUnselectProjectTypes(): void {
    this.searchProjectTypeText.set('');
    this.selectedProjectTypeId.set(null);
    this.filteredProjectTypes();
  }
  createType(event: PointerEvent): void {
    if (!this.canCreateProjectType()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание типа проекта',
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectType) => this.projectService.createProjectType(result)),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadProjectTypesTrigger.update((v) => v + 1)),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  updateType(event: PointerEvent, projectType: IProjectType): void {
    if (!this.canCreateProjectType()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'edit',
          title: 'Редактирование типа проекта',
          object: projectType,
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectType) =>
          this.projectService.updateProjectType(projectType.id, result),
        ),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => {
          this.reloadProjectTypesTrigger.update((v) => v + 1);
          this.reloadProjectsTrigger.update((v) => v + 1);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  deleteType(event: PointerEvent, projectType: IProjectType): void {
    if (!this.canCreateProjectType()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    if (projectType.has_projects) {
      this.dialog
        .open(AlertComponent, {
          width: '400px',
          data: {
            title: 'Недопустимое действие',
            message: 'Нельзя удалять тип проекта, к которому привязан проект.',
            cancelText: 'Ок',
            color: 'warn',
          } as ISetDialogData,
          disableClose: true,
        })
        .afterClosed()
        .pipe(
          take(1),
          tap(() => {
            if (button) button.disabled = false;
          }),
          finalize(() => {
            if (button) button.disabled = false;
          }),
        )
        .subscribe();
      return;
    }
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Удаление элемента',
          message: 'Вы уверены, что хотите удалить этот тип проектов? Действие необратимо.',
          confirmText: 'Удалить',
          cancelText: 'Отмена',
          color: 'warn',
        } as ISetDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap(() => this.projectService.deleteProjectType(projectType.id)),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadProjectTypesTrigger.update((v) => v + 1)),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  searchProjectCategoryText = signal('');
  filteredProjectCategories = computed(() => {
    const projectCategories = this.projectCategories();
    if (this.selectedProjectCategoryId()) {
      projectCategories().forEach((category) => {
        category.selected = category.id === this.selectedProjectCategoryId();
      });
    }
    const query = this.searchProjectCategoryText().trim().toLowerCase();
    if (!query) return projectCategories();
    return projectCategories().filter((p) => p.name.toLowerCase().includes(query));
  });
  onSelectProjectCategory(projectCategory: IProjectType, withClean: boolean = false): void {
    projectCategory.selected = true;
    this.selectedProjectCategoryId.set(projectCategory.id);
    if (withClean) {
      this.searchText.set('');
      this.selectedProjectTypeId.set(null);
      this.currentPage.set(1);
      this.pageSize.set(20);
      this.filteredProjectTypes();
    }
  }
  onUnselectProjectCategories(): void {
    this.searchProjectCategoryText.set('');
    this.selectedProjectCategoryId.set(null);
    this.filteredProjectCategories();
  }
  createCategory(event: PointerEvent): void {
    if (!this.canCreateProjectCategory()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание категории проекта',
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectCategory) => this.projectService.createProjectCategory(result)),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadProjectCategoriesTrigger.update((v) => v + 1)),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  updateCategory(event: PointerEvent, projectCategory: IProjectCategory): void {
    if (!this.canCreateProjectCategory()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'edit',
          title: 'Редактирование категории проекта',
          object: projectCategory,
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectCategory) =>
          this.projectService.updateProjectCategory(projectCategory.id, result),
        ),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => {
          this.reloadProjectCategoriesTrigger.update((v) => v + 1);
          this.reloadProjectsTrigger.update((v) => v + 1);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  deleteCategory(event: PointerEvent, projectCategory: IProjectCategory): void {
    if (!this.canCreateProjectCategory()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    if (projectCategory.has_projects) {
      this.dialog
        .open(AlertComponent, {
          width: '400px',
          data: {
            title: 'Недопустимое действие',
            message: 'Нельзя удалять категорию проекта, к которой привязан проект.',
            cancelText: 'Ок',
            color: 'warn',
          } as ISetDialogData,
          disableClose: true,
        })
        .afterClosed()
        .pipe(
          take(1),
          tap(() => {
            if (button) button.disabled = false;
          }),
          finalize(() => {
            if (button) button.disabled = false;
          }),
        )
        .subscribe();
      return;
    }
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Удаление элемента',
          message: 'Вы уверены, что хотите удалить эту категорию проектов? Действие необратимо.',
          confirmText: 'Удалить',
          cancelText: 'Отмена',
          color: 'warn',
        } as ISetDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap(() => this.projectService.deleteProjectCategory(projectCategory.id)),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.reloadProjectCategoriesTrigger.update((v) => v + 1)),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
}
