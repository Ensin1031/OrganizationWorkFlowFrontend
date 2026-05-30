import { Component, computed, HostBinding, inject, signal } from '@angular/core';
import { DefaultWorkTypesEnum, IWork } from '../../../interfaces/works';
import { WorkService } from '../../../services/work';
import { UserService } from '../../../services/user';
import { TasksListComponent } from '../tasks/tasks-list/tasks-list';
import { take, tap } from 'rxjs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgStyle } from '@angular/common';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { IStatus } from '../../../interfaces/references';
import { StatusesService } from '../../../services/work-references';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-table',
  imports: [
    TasksListComponent,
    MatIcon,
    MatIconButton,
    NgStyle,
    NgClass,
    MatMenu,
    MatRadioButton,
    MatRadioGroup,
    MatMenuTrigger,
    MatButton,
    EntitySelectComponent,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTableComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private userService = inject(UserService);
  protected workService = inject(WorkService);
  protected statusesService = inject(StatusesService);

  filters = signal<Record<string, any> | null | undefined>({});
  tasks = signal<IWork[]>([]);
  canCreateTask = signal<boolean>(false);

  hasMoreTasks = signal<boolean>(false);
  loadHasMoreTasks = signal<number>(0);

  searchText = signal('');

  constructor() {
    this.workService
      .getCanCreateTask()
      .pipe(
        take(1),
        tap((canCreate) => this.canCreateTask.set(canCreate)),
      )
      .subscribe();
  }

  getTasksFilters = computed(() => {
    let resultFilters: Record<
      string,
      string | number | boolean | string[] | number[] | null | undefined
    > = {
      ...(this.filters() ?? {}),
      execute_by: this.userService.user()?.id,
      without_types: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY],
    };
    if (this.searchText()) {
      resultFilters = { ...resultFilters, search: this.searchText() };
    }
    const selectedTasksStatuses = this.selectedTasksStatuses();
    if (selectedTasksStatuses && selectedTasksStatuses.length) {
      resultFilters = { ...resultFilters, only_statuses: selectedTasksStatuses.map((r) => r.id) };
    }
    return resultFilters;
  });

  storageViewTasksKey = (): string => `tasks.all.listIsOpen`;
  get taskListIsOpen(): boolean {
    return localStorage.getItem(this.storageViewTasksKey()) === 'true';
  }
  viewTasks(): void {
    return localStorage.setItem(this.storageViewTasksKey(), String(!this.taskListIsOpen));
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

  readonly loadTasksStatusesPage = this.statusesService.getList.bind(this.statusesService);
  selectedTasksStatuses = signal<IStatus[] | null>(null);
  selectedChangeTasksStatuses(selectedTasksStatuses: IStatus[] | null): void {
    this.selectedTasksStatuses.set(selectedTasksStatuses);
  }
}
