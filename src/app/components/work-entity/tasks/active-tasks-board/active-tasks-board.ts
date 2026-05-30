import { Component, computed, HostBinding, inject, signal } from '@angular/core';
import { SprintService } from '../../../../services/sprint';
import { WorkService } from '../../../../services/work';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, of, take, tap } from 'rxjs';
import { StatusesService } from '../../../../services/work-references';
import { DefaultWorkTypesEnum, IWork } from '../../../../interfaces/works';
import { MatDivider } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgStyle, NgTemplateOutlet, SlicePipe } from '@angular/common';
import { IUserExtendedShort } from '../../../../interfaces/user';
import { UserPhotoViewComponent } from '../../../common/user-photo-view/user-photo-view';
import { IProjectStatusShort } from '../../../../interfaces/project';
import { SafeSvgComponent } from '../../../common/safe-svg/safe-svg';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormField } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { DurationHumanizePipe } from '../../../../pipes/duration-humanize-pipe';
import { ISprint } from '../../../../interfaces/sprints';


@Component({
  selector: 'app-active-tasks-board',
  imports: [
    MatDivider,
    MatIcon,
    MatIconButton,
    ReactiveFormsModule,
    FormsModule,
    UserPhotoViewComponent,
    SafeSvgComponent,
    CdkDropListGroup,
    CdkDrag,
    CdkDropList,
    MatFormField,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    NgTemplateOutlet,
    NgStyle,
    RouterLink,
    MatTooltip,
    DurationHumanizePipe,
    SlicePipe,
  ],
  templateUrl: './active-tasks-board.html',
  styleUrls: ['./active-tasks-board.scss', '../sprint-card/sprint-card.scss'],
})
export class ActiveTasksBoardComponent {
  @HostBinding('class') class = 'h-100 w-100 take-full-page-height';

  private router = inject(Router);
  private sprintService = inject(SprintService);
  private statusesService = inject(StatusesService);
  private workService = inject(WorkService);

  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());

  private reloadTrigger = signal(0);
  refresh(): void {
    this.reloadTrigger.update((v) => v + 1);
  }
  activeSprintsResource = rxResource({
    params: () => ({
      reload: this.reloadTrigger(),
    }),
    stream: () => {
      return this.sprintService.getActiveSprints().pipe(
        tap((sprints) => {
          const selected = this.selectedSprintSlugs();
          if (!sprints.length || !!selected?.length || selected !== null) return;
          this.selectedSprintSlugs.set(sprints.map((sprint) => sprint.slug));
        }),
      );
    },
  });
  activeSprints = computed(() => this.activeSprintsResource.value() ?? []);
  activeSprintSlugs = computed(() => this.activeSprints().map((s) => s.slug));
  /**
   * null = выбраны все активные спринты
   * [] = ничего не выбрано
   * ['sprint-1'] = выбран конкретный sprint
   */
  selectedSprintSlugs = signal<string[] | null>(null);
  /** Итоговый список sprint slugs */
  sprintSlugs = computed(() => {
    const selected = this.selectedSprintSlugs();
    if (selected === null) return this.activeSprintSlugs();
    return selected;
  });
  boardDataResource = rxResource({
    params: () => ({
      reload: this.reloadTrigger(),
      sprintSlugs: this.sprintSlugs(),
    }),
    stream: ({ params }) => {
      if (!params.sprintSlugs.length) {
        return of({
          tasks: [],
          statuses: [],
        });
      }
      return forkJoin({
        tasks: this.workService.getBySprints({
          sprints: params.sprintSlugs,
          without_types: [
            DefaultWorkTypesEnum.EPIC as number,
            DefaultWorkTypesEnum.STORY as number,
          ],
        }),
        statuses: this.statusesService.getBySprints({ sprints: params.sprintSlugs }),
      });
    },
  });
  tasks = computed(() => this.boardDataResource.value()?.tasks ?? []);
  taskUsers = computed(() => {
    const tasks = this.boardDataResource.value()?.tasks ?? [];
    const uniqueUsers = new Map<number, NonNullable<(typeof tasks)[number]['execute_by']>>();
    tasks.forEach((task) => {
      const user = task.execute_by;
      if (!user) return;
      uniqueUsers.set(user.id, user);
    });
    return (
      Array.from(uniqueUsers.values()).sort((a, b) =>
        (a.full_name || '').localeCompare(b.full_name || ''),
      ) ?? []
    );
  });
  rootStatuses = computed(() => this.boardDataResource.value()?.statuses ?? []);
  statuses = computed<IProjectStatusShort[]>(() => {
    const grouped = new Map<number, IProjectStatusShort[]>();
    this.rootStatuses().forEach((status) => {
      const list = grouped.get(status.status) ?? [];
      list.push(status);
      grouped.set(status.status, list);
    });
    return Array.from(grouped.values())
      .map((group) => {
        return {
          ...group.reduce((prev, current) => {
            return current.priority > prev.priority ? current : prev;
          }),
          project_ids: [...new Set(group.map((item) => item.project_id))],
        };
      })
      .sort((a, b) => a.priority - b.priority);
  });

  tasksByUserAndStatus = (statusId: number, userId?: number): IWork[] => {
    if (!!userId) {
      return this.tasks().filter(
        (task) => task.execute_by?.id === userId && task.status?.status === statusId,
      );
    }
    return this.tasks().filter((task) => !task.execute_by?.id && task.status?.status === statusId);
  };

  isLoadingSprints = computed(() => this.activeSprintsResource.isLoading());
  isLoadingBoard = computed(() => this.boardDataResource.isLoading());
  sprintsError = computed(() => this.activeSprintsResource.error());
  boardError = computed(() => this.boardDataResource.error());

  storageViewUserTasksKey = (user?: IUserExtendedShort): string =>
    `tacks.boardByUser${user?.id ?? 'NaN'}.view-tasks`;
  isTaskListOpen = (user?: IUserExtendedShort): boolean => {
    return localStorage.getItem(this.storageViewUserTasksKey(user)) === 'true';
  };
  viewTasks = (user?: IUserExtendedShort): void => {
    return localStorage.setItem(
      this.storageViewUserTasksKey(user),
      String(!this.isTaskListOpen(user)),
    );
  };

  goToSprint = (sprint: ISprint) => this.router.navigate(['/home', 'sprints', sprint.slug]);
  selectedSprints = computed(() => {
    return this.activeSprints().filter((sprint) =>
      new Set(this.selectedSprintSlugs()).has(sprint.slug),
    );
  });

  dropListId = (userId: number, statusId: number): string => `drop-${userId}-${statusId}`;
  connectedDropLists(userId: number): string[] {
    return this.statuses().map((status) => this.dropListId(userId, status.status));
  }
  canDropTask = (drag: CdkDrag<IWork>, drop: CdkDropList<IWork[]>): boolean => {
    const targetStatus = this.statuses().find(
      (status) => status.status === Number(drop.id.split('-').pop()),
    );
    if (!targetStatus) return false;
    return targetStatus.project_ids?.includes(drag.data.project.id) ?? false;
  };
  dropTask(event: CdkDragDrop<IWork[]>, userId: number, targetStatus: IProjectStatusShort): void {
    const task = event.item.data as IWork;
    const taskStatus = this.rootStatuses().find(
      (status) => status.status === targetStatus.status && status.project_id === task.project.id,
    );
    if (!taskStatus) {
      return;
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    task.status = targetStatus;
    this.workService
      .patchWork(task.slug, { status_id: taskStatus.id })
      .pipe(
        take(1),
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
      )
      .subscribe();
  }
}
