import { Component, computed, HostBinding, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user';
import { WorkService } from '../../../services/work';
import { ProjectContextService } from '../../../services/project-context';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, forkJoin, switchMap, take, tap } from 'rxjs';
import { DefaultWorkTypesEnum, IWorkCreateOrUpdate } from '../../../interfaces/works';
import { MatDivider } from '@angular/material/list';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { ClassicEditor } from 'ckeditor5';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';
import { NgStyle } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TasksListComponent } from '../tasks/tasks-list/tasks-list';
import { CreateUpdateProjectDialogComponent, IProjectCreateUpdateDialogData } from '../../dialogs/create-update-project/create-update-project';
import { IProject, IProjectCreateOrUpdate } from '../../../interfaces/project';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateUpdateWorkDialogComponent, ICreateUpdateWorkDialogData } from '../../dialogs/create-update-work/create-update-work';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { FiltersType } from '../../../interfaces/common';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { IStatus } from '../../../interfaces/references';
import { IUserExtended } from '../../../interfaces/user';
import { StatusesService } from '../../../services/work-references';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';


@Component({
  selector: 'app-project-page',
  imports: [
    MatDivider,
    CKEditorModule,
    MatIcon,
    MatIconButton,
    NgStyle,
    MatMenu,
    MatMenuItem,
    TasksListComponent,
    MatMenuTrigger,
    MatRadioButton,
    MatRadioGroup,
    MatCheckbox,
    EntitySelectComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    FormsModule,
    SafeSvgComponent,
  ],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.scss', '../tasks/sprint-card/sprint-card.scss'],
})
export class ProjectPageComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  protected userService = inject(UserService);
  protected statusesService = inject(StatusesService);
  private projectService = inject(ProjectContextService);
  private workService = inject(WorkService);

  private reloadTrigger = signal(0);

  canEditProject = signal<boolean>(false);
  canCreateTask = signal<boolean>(false);
  searchText = signal('');

  private routeParams = toSignal(this.route.params, {
    initialValue: this.route.snapshot.params,
  });
  slug = computed(() => this.routeParams()['slug'] ?? '');
  projectResource = rxResource({
    params: () => ({
      slug: this.slug(),
      reload: this.reloadTrigger(),
    }),
    stream: ({ params }) => {
      if (!params.slug) return EMPTY;
      return forkJoin({
        canEdit: this.projectService.getCanEditProject(params.slug),
        canCreateTask: this.workService.getCanCreateTask(),
      }).pipe(
        tap(({ canEdit, canCreateTask }) => {
          this.canEditProject.set(canEdit);
          this.canCreateTask.set(canCreateTask);
        }),
        switchMap(() => this.projectService.getProject(params.slug)),
      );
    },
  });
  project = computed(() => this.projectResource.value());
  isLoading = computed(() => this.projectResource.isLoading());
  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());
  refreshProject = () => this.reloadTrigger.update((v) => v + 1);

  private reloadProjectTypesTrigger = signal(0);
  projectTypes$ = toSignal(
    toObservable(this.reloadProjectTypesTrigger).pipe(
      switchMap(() => this.projectService.getAllProjectTypes()),
    ),
    { initialValue: [] },
  );
  projectTypes = computed(() => this.projectTypes$);

  private reloadProjectCategoriesTrigger = signal(0);
  projectCategories$ = toSignal(
    toObservable(this.reloadProjectCategoriesTrigger).pipe(
      switchMap(() => this.projectService.getAllProjectCategories()),
    ),
    { initialValue: [] },
  );
  projectCategories = computed(() => this.projectCategories$);

  getTasksFilters = computed(() => {
    let resultFilters: FiltersType = {
      project: this.slug(),
      without_types: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY],
    };
    if (this.searchText()) {
      resultFilters = { ...resultFilters, search: this.searchText() };
    }
    if (this.onlyMyTasks() && !!this.userService.user()?.id) {
      resultFilters = { ...resultFilters, execute_by: [this.userService.user()?.id!] };
    }
    if (this.tasksWithoutExecutor()) {
      resultFilters = { ...resultFilters, without_execute_by: true };
    }
    const selectedTasksStatuses = this.selectedTasksStatuses();
    if (selectedTasksStatuses && selectedTasksStatuses.length) {
      resultFilters = { ...resultFilters, only_statuses: selectedTasksStatuses.map((r) => r.id) };
    }
    const selectedUsers = this.selectedUsers();
    if (selectedUsers && selectedUsers.length) {
      resultFilters = { ...resultFilters, execute_by_users: selectedUsers.map((r) => r.id) };
    }
    return resultFilters;
  });

  storageViewDescriptionKey = (): string => `projects.all.viewDescription`;
  get isDescriptionOpen(): boolean {
    return localStorage.getItem(this.storageViewDescriptionKey()) === 'true';
  }
  viewDescription(): void {
    return localStorage.setItem(this.storageViewDescriptionKey(), String(!this.isDescriptionOpen));
  }

  storageViewTasksKey = (): string => `projects.all.view-tasks`;
  get isTaskListOpen(): boolean {
    return localStorage.getItem(this.storageViewTasksKey()) === 'true';
  }
  viewTasks(): void {
    return localStorage.setItem(this.storageViewTasksKey(), String(!this.isTaskListOpen));
  }
  view(project: IProject): void {
    const dialogData: IProjectCreateUpdateDialogData = {
      mode: 'view',
      project: project,
      availableVersions: project.versions,
      availableCategories: this.projectCategories()(),
      availableTypes: this.projectTypes()(),
    };
    this.dialog.open(CreateUpdateProjectDialogComponent, {
      width: '700px',
      data: dialogData,
      disableClose: true,
    });
  }
  update(project: IProject): void {
    if (!this.canEditProject()) {
      return;
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
          return EMPTY;
        }),
        filter((response) => !!response),
        tap(() => this.refreshProject()),
      )
      .subscribe();
  }
  createTask(project: IProject): void {
    if (!this.canCreateTask) {
      return;
    }
    const user = this.userService.user();
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'create',
      title: 'Создание задачи',
      defaultData: {
        project: project,
      },
      filters: {
        types: { without: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY] },
      },
      work: undefined,
    };
    this.dialog
      .open(CreateUpdateWorkDialogComponent, {
        width: '700px',
        data: dialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((result) => !!result),
        switchMap((result) =>
          this.workService.createWork({
            ...result,
            created_by_id: user?.id,
          } as IWorkCreateOrUpdate),
        ),
        tap(() => this.refreshProject()),
      )
      .subscribe();
  }

  storageViewTasksPageSizeKey = (): string => 'tasks.all.viewTasksPageSize';
  readonly tasksPageSizeOptions = [10, 20, 50, 100, 200, 500, 1000];
  private getInitialTasksPageSize(): number {
    const saved = localStorage.getItem(this.storageViewTasksPageSizeKey());
    if (saved) {
      const id = Number(saved);
      if (this.tasksPageSizeOptions.filter((f) => f === id).length > 0) {
        return id;
      }
    }
    return 100;
  }
  tasksPageSize = signal<number>(this.getInitialTasksPageSize());
  setTasksPageSize(newSize: number): void {
    this.tasksPageSize.set(newSize);
    localStorage.setItem(this.storageViewTasksPageSizeKey(), String(newSize));
  }

  storageOnlyMyTasksKey = (): string => 'tasks.bySprint.all.onlyMyTasks';
  onlyMyTasks = signal<boolean>(localStorage.getItem(this.storageOnlyMyTasksKey()) === 'true');
  toggleOnlyMyTasks(checked: boolean): void {
    this.onlyMyTasks.set(checked);
    localStorage.setItem(this.storageOnlyMyTasksKey(), String(checked));
  }

  storageTasksWithoutExecutorKey = (): string => 'tasks.bySprint.all.tasksWithoutExecutor';
  tasksWithoutExecutor = signal<boolean>(
    localStorage.getItem(this.storageTasksWithoutExecutorKey()) === 'true',
  );
  toggleTasksWithoutExecutor(checked: boolean): void {
    this.tasksWithoutExecutor.set(checked);
    localStorage.setItem(this.storageTasksWithoutExecutorKey(), String(checked));
  }

  readonly loadTasksStatusesPage = this.statusesService.getList.bind(this.statusesService);
  selectedTasksStatuses = signal<IStatus[] | null>(null);
  selectedChangeTasksStatuses(selectedTasksStatuses: IStatus[] | null): void {
    this.selectedTasksStatuses.set(selectedTasksStatuses);
  }

  readonly loadUsersPage = this.userService.getUsers.bind(this.userService);
  selectedUsers = signal<IUserExtended[] | null>(null);
  selectedChangeUsers(users: IUserExtended[] | null): void {
    this.selectedUsers.set(users);
  }

  protected readonly Editor = ClassicEditor;
  protected readonly ckeditorConfig = ckeditorConfig;
}
