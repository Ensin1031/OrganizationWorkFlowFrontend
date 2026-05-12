import {
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ISprint } from '../../../../interfaces/sprints';
import { WorkService } from '../../../../services/work';
import { CommonModule } from '@angular/common';
import {
  DefaultWorkTypesEnum,
  IWork,
  IWorkCreateOrUpdate,
  IWorkPatch,
} from '../../../../interfaces/works';
import { ISelectStrictPageQuery, PaginatedResponse } from '../../../../interfaces/common';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { CreateUpdateWorkDialogComponent, ICreateUpdateWorkDialogData } from '../../../dialogs/create-update-work/create-update-work';
import { filter, switchMap, take, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ISetDialogData } from '../../../dialogs/confirmation/confirmation';
import { ChangeTaskSprintDialogComponent, IChangeTaskSprintDialogData } from '../../../dialogs/change-task-sprint/change-task-sprint';
import { StatusViewComponent } from '../../../common/status-view/status-view';
import { StatusesService } from '../../../../services/work-references';
import { DurationHumanizePipe } from '../../../../pipes/duration-humanize-pipe';
import { UserPhotoViewComponent } from '../../../common/user-photo-view/user-photo-view';
import { SafeSvgComponent } from '../../../common/safe-svg/safe-svg';


@Component({
  selector: 'app-tasks-list',
  imports: [
    CommonModule,
    RouterLink,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    StatusViewComponent,
    DurationHumanizePipe,
    UserPhotoViewComponent,
    SafeSvgComponent,
  ],
  templateUrl: './tasks-list.html',
  styleUrl: './tasks-list.scss',
})
export class TasksListComponent {
  @HostBinding('class') class = 'h-100 w-100 d-flex flex-column';

  private router = inject(Router);

  sprint = input<ISprint | null>(null);
  canMoveToSprint = input<boolean>(false);
  canCreate = input.required<boolean>();
  pageSize = input.required<number>();
  filters = input.required<Record<string, any> | null | undefined>();

  updateTaskSignal = output();

  protected workService = inject(WorkService);
  protected statusesService = inject(StatusesService);
  private dialog = inject(MatDialog);

  tasks = signal<IWork[]>([]);
  loading = signal(false);
  hasMore = signal(true);
  private currentPage = 1;

  private prevFiltersHash: string | undefined;
  private prevPageSize: number | undefined;

  constructor() {
    effect(() => {
      const filtersHash = JSON.stringify(this.filters());
      const pageSizeVal = this.pageSize();

      if (filtersHash === this.prevFiltersHash && pageSizeVal === this.prevPageSize) {
        return;
      }

      this.prevFiltersHash = filtersHash;
      this.prevPageSize = pageSizeVal;

      this.resetAndLoad();
    });
  }

  private resetAndLoad(): void {
    this.currentPage = 1;
    this.tasks.set([]);
    this.hasMore.set(true);
    this.loadTasks(true);
  }

  loadTasks(reset: boolean = false): void {
    if (this.loading()) return;
    if (!reset && !this.hasMore()) return;

    this.loading.set(true);
    const page = reset ? 1 : this.currentPage + 1;

    const query: ISelectStrictPageQuery = {
      page,
      pageSize: this.pageSize(),
      filters: this.filters() || {},
      ordering: '',
    };

    this.workService.getWorkPage(query).subscribe({
      next: (response: PaginatedResponse<IWork>) => {
        const newTasks = response.results;
        if (reset) {
          this.tasks.set(newTasks);
          this.currentPage = 1;
        } else {
          this.tasks.update((prev) => [...prev, ...newTasks]);
          this.currentPage++;
        }
        this.hasMore.set(!!response.next);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.loadTasks(false);
  }

  canChangeBySprintStatus = computed((): boolean => {
    return !!this.sprint() && !this.sprint()?.is_completed;
  });

  viewTask(task: IWork): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/home/tasks', task.slug]));
    window.open(url, '_blank');
  }
  editTask(task: IWork): void {
    if (!this.canCreate) {
      return;
    }
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'edit',
      title: 'Редактирование задачи',
      defaultData: {
        sprint: this.sprint(),
      },
      filters: {
        types: { without: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY] },
      },
      work: task,
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
          this.workService.updateWork(task.slug, result as IWorkCreateOrUpdate),
        ),
        tap(() => {
          this.resetAndLoad();
        }),
      )
      .subscribe();
  }
  removeTaskFromSprint(task: IWork): void {
    if (!this.canCreate) {
      return;
    }
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Удаление задачи из спринта',
          message: 'Вы уверены, что хотите удалить задачу из стпринта?',
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
        switchMap(() => this.workService.patchWork(task.slug, { sprint_id: null } as IWorkPatch)),
        tap(() => this.updateTaskSignal.emit()),
      )
      .subscribe();
  }
  changeTaskSprint(task: IWork, mode: 'add' | 'change'): void {
    if (!this.canCreate) {
      return;
    }

    this.dialog
      .open(ChangeTaskSprintDialogComponent, {
        width: '700px',
        data: {
          mode: mode,
          task: task,
          title: mode == 'add' ? 'Добавить задачу в спринт' : 'Изменение спринта задачи',
        } as IChangeTaskSprintDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((result) => !!result),
        switchMap((result: { sprint_id: number | null }) =>
          this.workService.patchWork(task.slug, { sprint_id: result.sprint_id } as IWorkPatch),
        ),
        tap(() => this.updateTaskSignal.emit()),
      )
      .subscribe();
  }
}
