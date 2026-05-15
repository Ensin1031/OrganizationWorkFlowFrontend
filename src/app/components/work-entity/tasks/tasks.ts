import {
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { SprintService } from '../../../services/sprint';
import { WorkService } from '../../../services/work';
import { TasksBySprintsComponent } from './by-sprints/by-sprints';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { UserService } from '../../../services/user';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { StatusesService } from '../../../services/work-references';
import { IStatus } from '../../../interfaces/references';
import { IUserExtended } from '../../../interfaces/user';

type TasksComponentQueryParams = {
  projectId?: string;
  byEpics?: string;
  bySprints?: string;
  search?: string;
  ordering?: string;
};


@Component({
  selector: 'app-tasks',
  imports: [
    TasksBySprintsComponent,
    MatFormField,
    MatSelect,
    FormsModule,
    MatOption,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatRadioButton,
    MatRadioGroup,
    MatMenuTrigger,
    MatCheckbox,
    EntitySelectComponent,
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatSuffix,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected sprintService = inject(SprintService);
  protected workService = inject(WorkService);
  protected userService = inject(UserService);
  protected statusesService = inject(StatusesService);

  projectId = signal<number | null>(null);
  byEpics = signal<boolean>(false);
  bySprints = signal<boolean>(false);
  searchText = signal('');

  tasksFilters = signal<
    | Record<string, string | number | boolean | string[] | number[] | null | undefined>
    | null
    | undefined
  >(null);
  getTasksFilters = computed(() => {
    let resultFilters: Record<
      string,
      string | number | boolean | string[] | number[] | null | undefined
    > = {};
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

  private queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams as TasksComponentQueryParams,
  });

  // URL -> STATE
  private syncFromUrl = effect(() => {
    const params = this.queryParams();
    this.searchText.set(params.search ?? '');
    this.projectId.set(params.projectId ? +params.projectId : null);
    this.byEpics.set(!!params.byEpics);
    this.bySprints.set(!!params.bySprints);
  });
  // STATE -> URL
  private syncToUrl = effect(() => {
    const params = this.queryParams();

    const next: TasksComponentQueryParams = {
      search: this.searchText() || undefined,
      projectId: !!this.projectId() ? String(this.projectId()) : undefined,
      byEpics: this.byEpics() ? String(true) : undefined,
      bySprints: this.bySprints() ? String(true) : undefined,
    };

    const isSame =
      (params.search ?? null) === next.search &&
      (params.projectId ?? null) === (next.projectId?.toString() ?? null) &&
      (params.byEpics ?? false) === (next.byEpics?.toString() ?? false) &&
      (params.bySprints ?? null) === (next.bySprints?.toString() ?? null);

    if (isSame) return;

    this.router.navigate([], {
      queryParams: next,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  // Получение разрешений с бэка при инициализации компонента
  private permissions = toSignal(
    forkJoin({
      canCreateTask: this.workService.getCanCreateTask(),
      canCreateSprint: this.sprintService.getCanCreate(),
      statusesChoices: this.statusesService.getStatusesChoices(),
    }),
    {
      initialValue: {
        canCreateTask: false,
        canCreateSprint: false,
        statusesChoices: [],
      },
    },
  );
  canCreateTask = computed(() => this.permissions().canCreateTask);
  canCreateSprint = computed(() => this.permissions().canCreateSprint);

  sprintFilters = [
    { id: 1, label: 'Не завершенные', filters: { is_completed: false } },
    { id: 2, label: 'Только активные', filters: { is_completed: false, in_work: true } },
    { id: 3, label: 'Только не начатые', filters: { is_completed: false, in_work: false } },
    { id: 4, label: 'Только завершенные', filters: { is_completed: true } },
    { id: 5, label: 'Все спринты', filters: {} },
  ];
  storageViewSprintsByFilterKey = (): string => `tasks.bySprint.filter.byWork`;
  private getInitialFilter(): number {
    const saved = localStorage.getItem(this.storageViewSprintsByFilterKey());
    if (saved) {
      const id = Number(saved);
      if (this.sprintFilters.some((f) => f.id === id)) {
        return id;
      }
    }
    return 1;
  }
  selectedFilter = signal<number>(this.getInitialFilter());
  onFilterChange(): void {
    localStorage.setItem(this.storageViewSprintsByFilterKey(), String(this.selectedFilter()));
  }
  sprintsSelectedFilters(): Record<string, string | number | string[] | number[] | boolean> {
    const resultFilters: Record<string, string | number | string[] | number[] | boolean> = {};
    Object.entries(
      (this.sprintFilters.find((r) => r.id === this.selectedFilter()) || { filters: {} }).filters,
    ).forEach(([key, value]) => {
      resultFilters[key] = String(value);
    });
    return resultFilters;
  }

  storageViewTasksPageSizeKey = (): string => 'tasks.bySprint.all.viewTasksPageSize';
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
  sprintTasksPageSize = signal<number>(this.getInitialTasksPageSize());
  setTasksPageSize(newSize: number): void {
    this.sprintTasksPageSize.set(newSize);
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
}
