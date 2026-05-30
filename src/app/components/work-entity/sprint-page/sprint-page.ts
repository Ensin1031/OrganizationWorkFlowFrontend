import { Component, computed, HostBinding, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService } from '../../../services/sprint';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, filter, finalize, forkJoin, map, switchMap, take, tap } from 'rxjs';
import { MatDivider } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TasksListComponent } from '../tasks/tasks-list/tasks-list';
import { NgStyle } from '@angular/common';
import { SprintStatus } from '../tasks/sprint-card/sprint-card';
import { IStatusChoices, StatusViewComponent } from '../../common/status-view/status-view';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { WorkService } from '../../../services/work';
import moment from 'moment/moment';
import { ISprint, ISprintCreateOrUpdate } from '../../../interfaces/sprints';
import {
  IViewSprintUsersLoadDialogData,
  ViewSprintUsersLoadDialogComponent
} from '../../dialogs/view-sprint-users-load/view-sprint-users-load';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ISetDialogData } from '../../dialogs/confirmation/confirmation';
import { DefaultWorkTypesEnum, IWorkCreateOrUpdate } from '../../../interfaces/works';
import {
  CreateUpdateSprintDialogComponent,
  ISprintCreateUpdateDialogData
} from '../../dialogs/create-update-sprint/create-update-sprint';
import {
  CreateUpdateWorkDialogComponent,
  ICreateUpdateWorkDialogData
} from '../../dialogs/create-update-work/create-update-work';
import { UserService } from '../../../services/user';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IStatus } from '../../../interfaces/references';
import { IUserExtended } from '../../../interfaces/user';
import { StatusesService } from '../../../services/work-references';
import { FiltersType } from '../../../interfaces/common';


@Component({
  selector: 'app-sprint-page',
  imports: [
    MatDivider,
    MatButton,
    MatIcon,
    MatIconButton,
    TasksListComponent,
    NgStyle,
    StatusViewComponent,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    CKEditorModule,
    MatRadioButton,
    MatRadioGroup,
    EntitySelectComponent,
    MatCheckbox,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './sprint-page.html',
  styleUrls: ['./sprint-page.scss', '../tasks/sprint-card/sprint-card.scss'],
})
export class SprintPageComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  protected userService = inject(UserService);
  protected statusesService = inject(StatusesService);
  private sprintService = inject(SprintService);
  private workService = inject(WorkService);

  private reloadTrigger = signal(0);
  searchText = signal('');

  canEditSprint = signal<boolean>(false);
  canCreateTask = signal<boolean>(false);

  private routeParams = toSignal(this.route.params, {
    initialValue: this.route.snapshot.params,
  });
  slug = computed(() => this.routeParams()['slug'] ?? '');
  sprintResource = rxResource({
    params: () => ({
      slug: this.slug(),
      reload: this.reloadTrigger(),
    }),
    stream: ({ params }) => {
      if (!params.slug) return EMPTY;
      return forkJoin({
        canEdit: this.sprintService.getCanEdit(params.slug),
        canCreateTask: this.workService.getCanCreateTask(),
      }).pipe(
        tap(({ canEdit, canCreateTask }) => {
          this.canEditSprint.set(canEdit);
          this.canCreateTask.set(canCreateTask);
        }),
        switchMap(() => this.sprintService.getSprint(params.slug)),
      );
    },
  });
  sprint = computed(() => this.sprintResource.value());
  isLoading = computed(() => this.sprintResource.isLoading());
  error = computed(() => this.sprintResource.error());
  refreshSprint = () => this.reloadTrigger.update((v) => v + 1);

  getTasksFilters = computed(() => {
    let resultFilters: FiltersType = {
      sprint: this.slug(),
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

  storageViewDescriptionKey = (): string => `sprints.all.viewDescription`;
  get isDescriptionOpen(): boolean {
    return localStorage.getItem(this.storageViewDescriptionKey()) === 'true';
  }
  viewSprintDescription(): void {
    return localStorage.setItem(this.storageViewDescriptionKey(), String(!this.isDescriptionOpen));
  }

  storageViewTasksKey = (): string => `tasks.bySprint.${this.sprint()?.id ?? -1}.view-tasks`;
  get isTaskListOpen(): boolean {
    return localStorage.getItem(this.storageViewTasksKey()) === 'true';
  }
  viewSprintTasks(): void {
    return localStorage.setItem(this.storageViewTasksKey(), String(!this.isTaskListOpen));
  }
  getSprintDates(sprint: ISprint): string {
    let result = '';
    const startDateValue = sprint.start_date;
    const startDate = !!startDateValue ? new Date(startDateValue) : undefined;
    const endDateValue = sprint.end_date;
    const endDate = !!endDateValue ? new Date(endDateValue) : undefined;
    if (startDate || endDate) {
      result += '(';
      if (startDate) {
        result += moment(startDate).format('DD.MM.YYYY');
      }
      if (startDate && endDate) {
        result += ' - ';
      }
      if (endDate) {
        result += moment(endDate).format('DD.MM.YYYY');
      }
      result += ')';
    }
    return result;
  }
  sprintStatusChoices(): IStatusChoices[] {
    return [
      { value: SprintStatus.ACTIVE, label: 'Активен', background: 'green', color: 'white' },
      { value: SprintStatus.NOT_ACTIVE, label: 'Не начат', background: 'darkblue', color: 'white' },
      { value: SprintStatus.CLOSED, label: 'Завершен', background: 'gray', color: 'white' },
    ];
  }
  sprintStatus(sprint: ISprint): SprintStatus {
    switch (true) {
      case sprint.is_completed: {
        return SprintStatus.CLOSED;
      }
      case sprint.in_work: {
        return SprintStatus.ACTIVE;
      }
      default: {
        return SprintStatus.NOT_ACTIVE;
      }
    }
  }
  changeSprintStatusBTNName(sprint: ISprint): string {
    switch (this.sprintStatus(sprint)) {
      case SprintStatus.ACTIVE: {
        return 'Завершить спринт';
      }
      case SprintStatus.NOT_ACTIVE: {
        return 'Начать спринт';
      }
      default: {
        return '';
      }
    }
  }
  changeSprintStatusBTNBackground(sprint: ISprint): string {
    switch (this.sprintStatus(sprint)) {
      case SprintStatus.ACTIVE: {
        return 'gray';
      }
      case SprintStatus.NOT_ACTIVE: {
        return 'green';
      }
      default: {
        return '';
      }
    }
  }
  changeSprintStatus(event: PointerEvent, sprint: ISprint): void {
    const sprintStatus = this.sprintStatus(sprint);
    if (!this.canEditSprint() || sprintStatus === SprintStatus.CLOSED) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    const goToStatus = () => {
      if (sprintStatus === SprintStatus.NOT_ACTIVE) {
        return SprintStatus.ACTIVE;
      }
      return SprintStatus.CLOSED;
    };
    const taskTitle = () => {
      if (sprintStatus === SprintStatus.NOT_ACTIVE) {
        return 'запустить';
      }
      return 'закрыть';
    };
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Изменение статуса спринта',
          message: `Вы уверены, что хотите ${taskTitle()} спринт? Действие необратимо.`,
          confirmText: 'Ок',
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
        map(() => {
          const updatedData: ISprintCreateOrUpdate = this.sprint() as ISprintCreateOrUpdate;
          if (goToStatus() === SprintStatus.CLOSED) {
            updatedData.in_work = true;
            updatedData.is_completed = true;
          } else {
            updatedData.in_work = true;
          }
          return updatedData;
        }),
        switchMap((result: ISprintCreateOrUpdate) =>
          this.sprintService.updateSprint(sprint.slug, result),
        ),
        tap(() => this.refreshSprint()),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  viewSprint(sprint: ISprint): void {
    const dialogData: ISprintCreateUpdateDialogData = {
      mode: 'view',
      title: 'Просмотр спринта',
      sprint: sprint,
    };
    this.dialog.open(CreateUpdateSprintDialogComponent, { width: '500px', data: dialogData });
  }
  updateSprint(sprint: ISprint): void {
    if (!this.canEditSprint()) {
      return;
    }
    const dialogData: ISprintCreateUpdateDialogData = {
      mode: 'edit',
      title: 'Редактирование спринта',
      sprint: sprint,
    };
    this.dialog
      .open(CreateUpdateSprintDialogComponent, {
        width: '500px',
        data: dialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((result) => !!result),
        switchMap((result: ISprintCreateOrUpdate) =>
          this.sprintService.updateSprint(sprint.slug, result),
        ),
        tap(() => this.refreshSprint()),
      )
      .subscribe();
  }
  deleteSprint(sprint: ISprint): void {
    if (!this.canEditSprint() || this.sprintStatus(sprint) !== SprintStatus.NOT_ACTIVE) {
      return;
    }
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Удаление спринта',
          message: `Вы уверены, что хотите удалить спринт? Действие необратимо.`,
          confirmText: 'Удалить',
          cancelText: 'Отмена',
          color: 'warn',
        } as ISetDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((result) => !!result),
        switchMap(() => this.sprintService.deleteSprint(sprint.slug)),
        tap(() => {
          this.router.navigate(['/home/tasks'], { queryParams: { bySprints: true } });
        }),
      )
      .subscribe();
  }

  createSprintTask(sprint: ISprint): void {
    if (!this.canCreateTask || this.sprintStatus(sprint) === SprintStatus.CLOSED) {
      return;
    }
    const user = this.userService.user();
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'create',
      title: 'Создание задачи',
      defaultData: {
        sprint: sprint,
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
        tap(() => this.refreshSprint()),
      )
      .subscribe();
  }

  viewUsersLoad(event: PointerEvent, sprint: ISprint): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(ViewSprintUsersLoadDialogComponent, {
        width: '700px',
        data: {
          sprint: sprint,
          filters: this.getTasksFilters(),
        } as IViewSprintUsersLoadDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
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

  protected readonly SprintStatus = SprintStatus;
  protected readonly Editor = ClassicEditor;
  protected readonly ckeditorConfig = ckeditorConfig;
}
