import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  HostBinding,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  merge,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { WorkService } from '../../../../services/work';
import {
  DefaultWorkTypesEnum,
  IWork,
  IWorkCreateOrUpdate,
  IWorkPatch,
} from '../../../../interfaces/works';
import { SafeSvgComponent } from '../../../common/safe-svg/safe-svg';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
import { ckeditorConfig } from '../../../../tokens/ckeditor-5-default-config';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { EntitySelectComponent } from '../../../common/entity-select/entity-select';
import {
  WorkDifficultiesService,
  WorkPrioritiesService,
  WorkTagsService,
  WorkTechnologiesService,
  WorkTypesService,
} from '../../../../services/work-references';
import {
  IWorkDifficulty,
  IWorkPriority,
  IWorkTag,
  IWorkTechnology,
  IWorkType,
} from '../../../../interfaces/references';
import { SprintService } from '../../../../services/sprint';
import { ISprint } from '../../../../interfaces/sprints';
import { IProjectStatus, IProjectVersion } from '../../../../interfaces/project';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { CreateUpdateWorkDialogComponent, ICreateUpdateWorkDialogData } from '../../../dialogs/create-update-work/create-update-work';
import { MatDialog } from '@angular/material/dialog';
import { UserPhotoViewComponent } from '../../../common/user-photo-view/user-photo-view';
import { UserService } from '../../../../services/user';
import { IUserExtendedShort } from '../../../../interfaces/user';
import { DurationHumanizePipe } from '../../../../pipes/duration-humanize-pipe';
import { WorkCommentService } from '../../../../services/work-comment';
import { defaultEmptyPage, ISelectStrictPageQuery } from '../../../../interfaces/common';
import { IWorkComment } from '../../../../interfaces/comments';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { WorkConnectionService } from '../../../../services/work-connection';
import { IWorkConnection, IWorkConnectionTypeItem, WorkConnectionTypes } from '../../../../interfaces/work-connections';


@Component({
  selector: 'app-task-view',
  imports: [
    RouterLink,
    SafeSvgComponent,
    MatIcon,
    MatIconButton,
    MatTooltip,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgClass,
    NgStyle,
    EntitySelectComponent,
    MatOption,
    MatSelect,
    MatFormField,
    MatButton,
    MatLabel,
    UserPhotoViewComponent,
    DatePipe,
    DurationHumanizePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './task-view.html',
  styleUrls: ['./task-view.scss'],
})
export class TaskViewComponent {
  @HostBinding('class') class = 'h-100 w-100 take-full-page-height';

  public Editor = ClassicEditor;

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  protected workService = inject(WorkService);
  protected workConnectionService = inject(WorkConnectionService);
  protected workCommentService = inject(WorkCommentService);
  protected userService = inject(UserService);
  protected workTypesService = inject(WorkTypesService);
  protected prioritiesService = inject(WorkPrioritiesService);
  protected sprintService = inject(SprintService);
  protected tagsService = inject(WorkTagsService);
  protected difficultiesService = inject(WorkDifficultiesService);
  protected technologiesService = inject(WorkTechnologiesService);

  taskSlug!: string;
  canCreateTaskSignal = signal<boolean>(false);
  canCreateTask = computed(() => this.canCreateTaskSignal());
  canEditSignal = signal<boolean>(false);
  canEdit = computed(() => this.canEditSignal());
  taskSignal = signal<IWork | null>(null);
  task = computed(() => this.taskSignal());

  readonly groupTypes = [DefaultWorkTypesEnum.EPIC as number, DefaultWorkTypesEnum.STORY as number];
  isGroupStatus = signal<boolean>(false);

  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());

  constructor() {
    this.route.paramMap
      .pipe(
        filter((params) => !!params.get('slug')),
        tap((params) => {
          const newSlug = params.get('slug')!;
          if (this.taskSlug === newSlug) {
            return;
          }
          this.taskSlug = newSlug;
          this.loadTaskData();
        }),
      )
      .subscribe();
  }

  private loadTaskData(): void {
    merge(
      this.workService
        .getCanCreateTask()
        .pipe(tap((canCreate) => this.canCreateTaskSignal.set(canCreate))),
      this.workService
        .getCanEdit(this.taskSlug)
        .pipe(tap((canEdit) => this.canEditSignal.set(canEdit))),
      this.workCommentService
        .getCanCreate()
        .pipe(tap((canCreate) => this.canCreateCommentSignal.set(canCreate))),
      this.workService.getWork(this.taskSlug).pipe(
        tap((work) => {
          this.applyWorkData(work);
        }),
      ),
    ).subscribe();
  }
  private applyWorkData(work: IWork): void {
    this.taskSignal.set(work);
    this.isGroupStatus.set(this.groupTypes.includes(work.type?.id ?? -1));
    this.selectedWorkStatus.set((work.status as IProjectStatus) ?? null);
    this.workProjectStatuses.set((work.project.statuses as IProjectStatus[]) ?? []);
    this.selectedChangeType.set((work.type as IWorkType) ?? null);
    this.selectedChangePriority.set((work.priority as IWorkPriority) ?? null);
    this.selectedChangeEpic.set((work.epic as IWork) ?? null);
    this.workEpicTypeFilter.set({
      type: DefaultWorkTypesEnum.EPIC as number,
      project: work.project.slug,
    });
    this.connectionWorkTypeFilter.set({
      without_types: this.groupTypes,
      without_rows: [this.taskSlug],
      project: work.project.slug,
    });
    this.selectedChangeSprint.set((work.sprint as ISprint) ?? null);
    this.selectedChangeTags.set((work.tags as IWorkTag[]) ?? []);
    this.projectsVersionsSignal.set((work.project.versions as IProjectVersion[]) ?? []);
    this.selectedChangeVersions.set((work.versions as IProjectVersion[]) ?? []);
    this.selectedChangeDifficulty.set((work.difficulty as IWorkDifficulty) ?? null);
    this.selectedChangeTechnology.set((work.technology as IWorkTechnology) ?? null);

    this.selectedChangeExecuteBy.set((work.execute_by as IUserExtendedShort) ?? null);
  }

  // Хэдер
  nameChange = signal<boolean>(false);
  descriptionChange = signal<boolean>(false);
  descriptionEditor: any;

  selectedWorkStatus = signal<IProjectStatus | null>(null);
  workProjectStatuses = signal<IProjectStatus[]>([]);

  // Левые блоки
  typeChange = signal<boolean>(false);
  selectedChangeType = signal<IWorkType | null>(null);
  readonly loadTypesPage = this.workTypesService.getList.bind(this.workTypesService);

  priorityChange = signal<boolean>(false);
  selectedChangePriority = signal<IWorkPriority | null>(null);
  readonly loadPrioritiesPage = this.prioritiesService.getList.bind(this.prioritiesService);

  epicChange = signal<boolean>(false);
  selectedChangeEpic = signal<IWork | null>(null);
  workEpicTypeFilter = signal<Record<string, string | number>>({});
  readonly loadEpicPage = this.workService.getWorkPage.bind(this.workService);

  sprintChange = signal<boolean>(false);
  selectedChangeSprint = signal<ISprint | null>(null);
  readonly loadSprintsPage = this.sprintService.getSprintPage.bind(this.sprintService);

  tagsChange = signal<boolean>(false);
  selectedChangeTags = signal<IWorkTag[] | []>([]);
  readonly loadTagsPage = this.tagsService.getList.bind(this.tagsService);

  versionsChange = signal<boolean>(false);
  selectedChangeVersions = signal<IProjectVersion[] | []>([]);
  projectsVersionsSignal = signal<IProjectVersion[] | []>([]);

  difficultyChange = signal<boolean>(false);
  selectedChangeDifficulty = signal<IWorkDifficulty | null>(null);
  readonly loadDifficultiesPage = this.difficultiesService.getList.bind(this.difficultiesService);

  technologyChange = signal<boolean>(false);
  selectedChangeTechnology = signal<IWorkTechnology | null>(null);
  readonly loadTechnologiesPage = this.technologiesService.getList.bind(this.technologiesService);

  // Правый блок
  executeByChange = signal<boolean>(false);
  selectedChangeExecuteBy = signal<IUserExtendedShort | null>(null);
  readonly loadExecuteByPage = this.userService.getUsers.bind(this.userService);

  compareById(obj1: any, obj2: any): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  update(data: IWorkPatch, signal?: WritableSignal<boolean>): void {
    if (!this.task() || !this.canEdit() || Object.keys(data).length === 0) {
      signal?.set(false);
      return;
    }
    this.workService
      .patchWork(this.task()!.slug, data)
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
        filter((response) => !!response),
        tap((task) => {
          this.taskSignal.set(task);
          signal?.set(false);
        }),
        finalize(() => signal?.set(false)),
      )
      .subscribe();
  }
  editTask(event: PointerEvent): void {
    if (!this.canEdit()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'edit',
      title: 'Редактирование задачи',
      defaultData: {},
      filters: {
        types: { without: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY] },
      },
      work: this.task() ?? undefined,
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
          this.workService.updateWork(this.task()!.slug, result as IWorkCreateOrUpdate),
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
        tap((work) => {
          if (button) button.disabled = false;
          this.applyWorkData(work);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  storageDetailsBlockViewKey = (): string => `task.opened.detailsBlock`;
  get detailsBlockIsView(): boolean {
    return localStorage.getItem(this.storageDetailsBlockViewKey()) === 'true';
  }
  viewDetailsBlock(): void {
    return localStorage.setItem(
      this.storageDetailsBlockViewKey(),
      String(!this.detailsBlockIsView),
    );
  }

  storageDescriptionBlockViewKey = (): string => `task.opened.descriptionBlock`;
  get descriptionBlockIsView(): boolean {
    return localStorage.getItem(this.storageDescriptionBlockViewKey()) === 'true';
  }
  viewDescriptionBlock(): void {
    return localStorage.setItem(
      this.storageDescriptionBlockViewKey(),
      String(!this.descriptionBlockIsView),
    );
  }

  storageCommentsBlockViewKey = (): string => `task.opened.commentsBlock`;
  get commentsBlockIsView(): boolean {
    return localStorage.getItem(this.storageCommentsBlockViewKey()) === 'true';
  }
  viewCommentsBlock(): void {
    return localStorage.setItem(
      this.storageCommentsBlockViewKey(),
      String(!this.commentsBlockIsView),
    );
  }
  setViewCommentsBlock = (): void =>
    localStorage.setItem(this.storageCommentsBlockViewKey(), String(true));

  storageGroupTasksBlockViewKey = (): string => `task.opened.groupTasksBlock`;
  get groupTasksBlockIsView(): boolean {
    return localStorage.getItem(this.storageGroupTasksBlockViewKey()) === 'true';
  }
  viewGroupTasksBlock(): void {
    return localStorage.setItem(
      this.storageGroupTasksBlockViewKey(),
      String(!this.groupTasksBlockIsView),
    );
  }

  storageConnectionsBlockViewKey = (): string => `task.opened.connectionsBlock`;
  get connectionsBlockIsView(): boolean {
    return localStorage.getItem(this.storageConnectionsBlockViewKey()) === 'true';
  }
  viewConnectionsBlock(): void {
    return localStorage.setItem(
      this.storageConnectionsBlockViewKey(),
      String(!this.connectionsBlockIsView),
    );
  }

  private reloadCommentsTrigger = signal(0);
  commentsCurrentPage = signal(1);
  commentsPageSize = signal(10);
  private getCommentsParams = computed<ISelectStrictPageQuery & { reload: number }>(() => ({
    reload: this.reloadCommentsTrigger(),
    page: this.commentsCurrentPage(),
    pageSize: this.commentsPageSize(),
  }));
  private commentsResponse = toSignal(
    toObservable(this.getCommentsParams).pipe(
      debounceTime(100),
      switchMap((params) =>
        this.workCommentService.getCommentsPage(this.taskSlug, params).pipe(
          tap((commentsPage) => {
            const comments = commentsPage.results.map((comment) => {
              comment.changeInputContent = comment.description;
              comment.changeMode = false;
              return comment;
            });
            this.hasNextCommentsPage.set(!!commentsPage.next);
            if (params.page === 1) {
              this.comments.set(comments);
            } else {
              this.comments.update((prev) => [...prev, ...comments]);
            }
          }),
        ),
      ),
    ),
    { initialValue: defaultEmptyPage },
  );
  hasNextCommentsPage = signal<boolean>(false);
  comments = signal<IWorkComment[]>([]);
  canCreateCommentSignal = signal<boolean>(false);
  canCreateComment = computed(() => this.canCreateCommentSignal());
  canEditComment = (comment: IWorkComment): boolean => {
    return comment.created_by.id === this.userService.user()?.id;
  };
  reloadComments(): void {
    this.commentsCurrentPage.set(1);
    this.reloadCommentsTrigger.update((v) => v + 1);
  }
  loadNextCommentsPage(): void {
    if (!this.hasNextCommentsPage()) return;
    this.commentsCurrentPage.update((v) => v + 1);
  }
  canViewChangedComment(comment: IWorkComment): boolean {
    const created = new Date(comment.created);
    const updated = new Date(comment.updated);
    if (created && updated) {
      return (
        created.getFullYear() !== updated.getFullYear() ||
        created.getMonth() !== updated.getMonth() ||
        created.getDate() !== updated.getDate() ||
        created.getHours() !== updated.getHours() ||
        created.getMinutes() !== updated.getMinutes()
      );
    }
    return false;
  }
  createNewCommentMode = signal<boolean>(false);
  newCommentContent = signal<string>('');
  createComment(event: PointerEvent): void {
    if (!this.newCommentContent() || !this.canCreateComment() || !this.createNewCommentMode()) {
      this.newCommentContent.set('');
      this.createNewCommentMode.set(false);
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    this.workCommentService
      .create({
        description: this.newCommentContent(),
        work_id: this.taskSlug,
        created_by_id: this.userService.user()?.id,
      })
      .pipe(
        take(1),
        tap(() => {
          this.newCommentContent.set('');
          this.createNewCommentMode.set(false);
          if (button) button.disabled = true;
          this.reloadComments();
        }),
      )
      .subscribe();
  }
  editComment(comment: IWorkComment) {
    if (
      !comment.changeInputContent ||
      !comment.changeMode ||
      !this.canCreateComment() ||
      !this.canEditComment(comment)
    ) {
      return;
    }
    this.workCommentService
      .patch(comment.slug, { description: comment.changeInputContent })
      .pipe(
        take(1),
        tap((changedComment) => {
          comment.updated = changedComment.updated;
          comment.description = comment.changeInputContent!;
          comment.changeMode = false;
        }),
      )
      .subscribe();
  }
  deleteComment(comment: IWorkComment) {
    if (!this.canCreateComment() || !this.canEditComment(comment)) {
      return;
    }
    this.workCommentService
      .delete(comment.slug)
      .pipe(
        take(1),
        tap(() => {
          this.reloadComments();
        }),
      )
      .subscribe();
  }

  private reloadGroupTasksTrigger = signal(0);
  groupTasksCurrentPage = signal(1);
  groupTasksPageSize = signal(10);
  hasNextGroupTasksPage = signal<boolean>(false);
  groupTasks = signal<IWork[]>([]);
  private groupTasksResponse = toSignal(
    toObservable(
      computed(() => {
        const task = this.task();
        return {
          reload: this.reloadGroupTasksTrigger(),
          workSlug: this.taskSlug,
          isGroup: this.groupTypes.includes(task?.type?.id ?? -1),
          page: this.groupTasksCurrentPage(),
          pageSize: this.groupTasksPageSize(),
          epic: task?.slug,
          project: task?.project?.slug,
        };
      }),
    ).pipe(
      filter((v) => !!v.workSlug && v.isGroup),
      switchMap((params) =>
        this.workService
          .getWorkPage({
            page: params.page,
            pageSize: params.pageSize,
            filters: {
              epic: params.epic,
              project: params.project,
            },
          })
          .pipe(
            tap((groupTasks) => {
              this.hasNextGroupTasksPage.set(!!groupTasks.next);
              if (params.page === 1) {
                this.groupTasks.set(groupTasks.results);
              } else {
                this.groupTasks.update((prev) => [...prev, ...groupTasks.results]);
              }
            }),
          ),
      ),
    ),
    { initialValue: defaultEmptyPage },
  );
  loadNextGroupTasksPage(): void {
    if (!this.hasNextGroupTasksPage()) return;
    this.groupTasksCurrentPage.update((v) => v + 1);
  }
  reloadGroupTasks(): void {
    this.groupTasksCurrentPage.set(1);
    this.reloadGroupTasksTrigger.update((v) => v + 1);
  }
  createGroupTask(event: PointerEvent): void {
    if (!this.canCreateTask()) return;
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    const user = this.userService.user();
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'create',
      title: 'Создание задачи',
      defaultData: {
        epic: this.task(),
        project: this.task()?.project,
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
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result) =>
          this.workService.createWork({
            ...result,
            created_by_id: user?.id,
          } as IWorkCreateOrUpdate),
        ),
        tap(() => {
          if (button) button.disabled = false;
          this.reloadGroupTasks();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  private reloadConnectionsTrigger = signal(0);
  connections = signal<IWorkConnection[]>([]);
  private connectionsResponse = toSignal(
    toObservable(
      computed(() => {
        const task = this.task();
        return {
          reload: this.reloadConnectionsTrigger(),
          workSlug: this.taskSlug,
          isGroup: this.groupTypes.includes(task?.type?.id ?? -1),
        };
      }),
    ).pipe(
      filter((v) => !!v.workSlug && !v.isGroup),
      switchMap((params) => this.workConnectionService.getList({ workSlug: params.workSlug! })),
      tap((connections) => this.connections.set(connections)),
    ),
    { initialValue: [] },
  );
  reloadConnections(): void {
    this.reloadConnectionsTrigger.update((v) => v + 1);
  }
  getConnectionsByType(connectionType: IWorkConnectionTypeItem): IWorkConnection[] {
    return this.connections()
      .filter((connection) => !!connection.type_id)
      .filter((connection) => connection.type_id === connectionType.id);
  }
  viewCreateConnectionFields = signal<boolean>(false);
  selectedConnectionTask = signal<IWork | null>(null);
  selectedConnectionTaskType = signal<IWorkConnectionTypeItem | null>(null);
  connectionWorkTypeFilter = signal<Record<string, string | number | string[] | number[]>>({});
  readonly loadConnectionTaskPage = this.workService.getWorkPage.bind(this.workService);
  createTaskConnection(event: PointerEvent): void {
    const connectionTaskType = this.selectedConnectionTaskType();
    const connectionTask = this.selectedConnectionTask();
    if (!this.canEdit() || !connectionTaskType || !connectionTask) return;
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    this.workConnectionService
      .create({
        type: connectionTaskType.id,
        work_from_id: connectionTask.slug,
        work_to_id: this.taskSlug,
      })
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
          this.viewCreateConnectionFields.set(false);
          this.selectedConnectionTaskType.set(null);
          this.selectedConnectionTask.set(null);
          this.reloadConnections();
        }),
      )
      .subscribe();
  }
  deleteTaskConnection(event: PointerEvent, connection: IWorkConnection): void {
    if (!this.canEdit()) return;
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    this.workConnectionService
      .delete(connection.id)
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
          this.reloadConnections();
        }),
      )
      .subscribe();
  }

  protected readonly ckeditorConfig = ckeditorConfig;
  protected readonly ckeditorCommentConfig = {
    ...ckeditorConfig,
    placeholder: 'Введите комментарий...',
  };
  protected readonly DefaultWorkTypesEnum = DefaultWorkTypesEnum;
  protected readonly WorkConnectionTypes = WorkConnectionTypes;
}
