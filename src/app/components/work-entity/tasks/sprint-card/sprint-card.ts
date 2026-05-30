import { Component, computed, inject, input, output } from '@angular/core';
import { ISprint, ISprintCreateOrUpdate } from '../../../../interfaces/sprints';
import moment from 'moment';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IStatusChoices, StatusViewComponent } from '../../../common/status-view/status-view';
import { NgStyle } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { SprintService } from '../../../../services/sprint';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ISetDialogData } from '../../../dialogs/confirmation/confirmation';
import { filter, finalize, map, switchMap, take, tap } from 'rxjs';
import {
  CreateUpdateSprintDialogComponent,
  ISprintCreateUpdateDialogData,
} from '../../../dialogs/create-update-sprint/create-update-sprint';
import { TasksListComponent } from '../tasks-list/tasks-list';
import { WorkService } from '../../../../services/work';
import {
  CreateUpdateWorkDialogComponent,
  ICreateUpdateWorkDialogData,
} from '../../../dialogs/create-update-work/create-update-work';
import { DefaultWorkTypesEnum, IWork, IWorkCreateOrUpdate } from '../../../../interfaces/works';
import { MatDivider } from '@angular/material/list';
import { UserService } from '../../../../services/user';
import { MatTooltip } from '@angular/material/tooltip';
import { IViewSprintUsersLoadDialogData, ViewSprintUsersLoadDialogComponent } from '../../../dialogs/view-sprint-users-load/view-sprint-users-load';

export enum SprintStatus {
  ACTIVE = 1,
  NOT_ACTIVE = 2,
  CLOSED = 3,
}


@Component({
  selector: 'app-sprint-card',
  imports: [
    MatIconButton,
    MatIcon,
    StatusViewComponent,
    MatButton,
    NgStyle,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    TasksListComponent,
    MatDivider,
    MatTooltip,
  ],
  templateUrl: './sprint-card.html',
  styleUrls: ['./sprint-card.scss'],
})
export class SprintCardComponent {
  canCreateTask = input.required<boolean>();
  tasksFilters = input.required<
    | Record<string, string | number | boolean | string[] | number[] | null | undefined>
    | null
    | undefined
  >();
  tasksPageSize = input.required<number>();
  canCreateSprint = input.required<boolean>();
  sprint = input.required<ISprint>();

  getTasksFilters = computed(() => {
    return {
      ...(this.tasksFilters() ?? {}),
      sprint: this.sprint().slug,
      without_types: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY],
    };
  });

  updateSprintsSignal = output();
  readonly SprintStatus = SprintStatus;

  protected userService = inject(UserService);
  private sprintService = inject(SprintService);
  private workService = inject(WorkService);
  private dialog = inject(MatDialog);

  storageViewTasksKey = (): string => `tasks.bySprint.${this.sprint().id}.view-tasks`;
  get isTaskListOpen(): boolean {
    return localStorage.getItem(this.storageViewTasksKey()) === 'true';
  }
  viewSprintTasks(): void {
    return localStorage.setItem(this.storageViewTasksKey(), String(!this.isTaskListOpen));
  }

  get sprintDates(): string {
    let result = '';
    const startDateValue = this.sprint().start_date;
    const startDate = !!startDateValue ? new Date(startDateValue) : undefined;
    const endDateValue = this.sprint().end_date;
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
  sprintStatus(): SprintStatus {
    switch (true) {
      case this.sprint().is_completed: {
        return SprintStatus.CLOSED;
      }
      case this.sprint().in_work: {
        return SprintStatus.ACTIVE;
      }
      default: {
        return SprintStatus.NOT_ACTIVE;
      }
    }
  }
  changeSprintStatusBTNName(): string {
    switch (this.sprintStatus()) {
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
  changeSprintStatusBTNBackground(): string {
    switch (this.sprintStatus()) {
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
  changeSprintStatus(event: PointerEvent): void {
    const sprintStatus = this.sprintStatus();
    if (!this.canCreateSprint() || sprintStatus === SprintStatus.CLOSED) {
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
          this.sprintService.updateSprint(this.sprint().slug, result),
        ),
        tap(() => {
          this.updateSprintsSignal.emit();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  viewSprint(): void {
    const dialogData: ISprintCreateUpdateDialogData = {
      mode: 'view',
      title: 'Просмотр спринта',
      sprint: this.sprint(),
    };
    this.dialog.open(CreateUpdateSprintDialogComponent, { width: '500px', data: dialogData });
  }
  updateSprint(): void {
    if (!this.canCreateSprint) {
      return;
    }
    const dialogData: ISprintCreateUpdateDialogData = {
      mode: 'edit',
      title: 'Редактирование спринта',
      sprint: this.sprint(),
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
          this.sprintService.updateSprint(this.sprint().slug, result),
        ),
        tap(() => {
          this.updateSprintsSignal.emit();
        }),
      )
      .subscribe();
  }
  deleteSprint(): void {
    if (!this.canCreateSprint || this.sprintStatus() !== SprintStatus.NOT_ACTIVE) {
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
        switchMap(() => this.sprintService.deleteSprint(this.sprint().slug)),
        tap(() => {
          this.updateSprintsSignal.emit();
        }),
      )
      .subscribe();
  }

  createSprintTask(): void {
    if (!this.canCreateTask || this.sprintStatus() === SprintStatus.CLOSED) {
      return;
    }
    const user = this.userService.user();
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'create',
      title: 'Создание задачи',
      defaultData: {
        sprint: this.sprint(),
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
        tap(() => {
          this.updateSprintsSignal.emit();
        }),
      )
      .subscribe();
  }

  viewUsersLoad(event: PointerEvent): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog.open(ViewSprintUsersLoadDialogComponent, {
      width: '700px',
      data: {
        sprint: this.sprint(),
        filters: this.getTasksFilters(),
      } as IViewSprintUsersLoadDialogData,
      disableClose: true,
    }).afterClosed().pipe(
      take(1),
      tap(() => {
        if (button) button.disabled = false;
      })
    ).subscribe();
  }
}
