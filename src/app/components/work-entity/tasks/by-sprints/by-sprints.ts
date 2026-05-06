import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { SprintService } from '../../../../services/sprint';
import { ISprint, ISprintCreateOrUpdate } from '../../../../interfaces/sprints';
import { debounceTime, filter, finalize, fromEvent, switchMap, take, tap } from 'rxjs';
import { SprintCardComponent } from '../sprint-card/sprint-card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  CreateUpdateSprintDialogComponent,
  ISprintCreateUpdateDialogData,
} from '../../../dialogs/create-update-sprint/create-update-sprint';
import { MatDialog } from '@angular/material/dialog';
import { TasksListComponent } from '../tasks-list/tasks-list';
import { NgStyle } from '@angular/common';
import { DefaultWorkTypesEnum } from '../../../../interfaces/works';


@Component({
  selector: 'app-tasks-by-sprints',
  imports: [SprintCardComponent, MatButton, MatIcon, MatIconButton, TasksListComponent, NgStyle],
  templateUrl: './by-sprints.html',
  styleUrl: './by-sprints.scss',
})
export class TasksBySprintsComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';
  canCreateSprint = input.required<boolean>();
  canCreateTask = input.required<boolean>();
  filters = input.required<
    | Record<string, string | number | boolean | string[] | number[] | null | undefined>
    | null
    | undefined
  >();
  tasksFilters = input.required<
    | Record<string, string | number | boolean | string[] | number[] | null | undefined>
    | null
    | undefined
  >();
  sprintTasksPageSize = input.required<number>();
  private previousFilters = '';

  private sprintService = inject(SprintService);
  private dialog = inject(MatDialog);
  private scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  private page = signal(1);
  private pageSize = 20;

  loading = signal(false);
  private hasMore = signal(true);

  private updatedTasksFiltersSignal = signal<Record<
    string,
    string | number | boolean | string[] | number[] | null | undefined
  > | null>(null);

  private items = signal<ISprint[]>([]);
  readonly sprints = computed(() => this.items());

  constructor() {
    effect(() => {
      const filters = this.filters();
      const serialized = JSON.stringify(filters);
      if (this.previousFilters === serialized) {
        return;
      }
      this.previousFilters = serialized;
      untracked(() => {
        this.page.set(1);
        this.items.set([]);
        this.hasMore.set(true);
        this.loadSprints();
      });
    });

    afterNextRender(() => {
      const container = this.scrollContainer().nativeElement;
      fromEvent(container, 'scroll')
        .pipe(
          debounceTime(100),
          filter(() => !this.loading()),
          filter(() => this.hasMore()),
          filter(() => {
            const threshold = 300;
            return (
              container.scrollTop + container.clientHeight >= container.scrollHeight - threshold
            );
          }),
        )
        .subscribe(() => {
          this.loadNextPage();
        });
    });
  }

  private loadNextPage(): void {
    this.page.update((v) => v + 1);
    this.loadSprints();
  }

  private loadSprints(): void {
    this.loading.set(true);
    this.sprintService
      .getSprintPage({ page: this.page(), pageSize: this.pageSize, filters: this.filters() })
      .subscribe((response) => {
        if (response.results.length < this.pageSize) {
          this.hasMore.set(false);
        }
        this.items.update((current) => [...current, ...response.results]);
        this.loading.set(false);
      });
  }
  updateSprintsList(): void {
    if (this.updatedTasksFiltersSignal()) {
      this.updatedTasksFiltersSignal.set(null);
    } else {
      this.updatedTasksFiltersSignal.set({ up: true });
    }
    this.items.set([]);
    this.page.set(1);
    this.loadSprints();
  }

  storageViewTasksKey = (): string => `tasks.bySprint.all.view-tasks`;
  get isTaskListOpen(): boolean {
    return localStorage.getItem(this.storageViewTasksKey()) === 'true';
  }
  viewWithoutSprintTasks(): void {
    return localStorage.setItem(this.storageViewTasksKey(), String(!this.isTaskListOpen));
  }

  createSprint(event: PointerEvent): void {
    if (!this.canCreateSprint()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateSprintDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание спринта',
        } as ISprintCreateUpdateDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: ISprint) =>
          this.sprintService.createSprint(result as ISprintCreateOrUpdate),
        ),
        tap(() => this.updateSprintsList()),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  getTasksWithoutSprintsFilters = computed(
    (): Record<string, string | number | boolean | string[] | number[] | null | undefined> => {
      return {
        ...(this.tasksFilters() ?? {}),
        ...(this.updatedTasksFiltersSignal() ?? {}),
        without_sprints: true,
        without_types: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY],
      };
    },
  );
}
