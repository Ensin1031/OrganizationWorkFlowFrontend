import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
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
  protected workCommentService = inject(WorkCommentService);
  protected userService = inject(UserService);
  protected workTypesService = inject(WorkTypesService);
  protected prioritiesService = inject(WorkPrioritiesService);
  protected sprintService = inject(SprintService);
  protected tagsService = inject(WorkTagsService);
  protected difficultiesService = inject(WorkDifficultiesService);
  protected technologiesService = inject(WorkTechnologiesService);

  private reloadTaskTrigger = signal(0);

  taskSlug!: string;
  canEditSignal = signal<boolean>(false);
  canEdit = computed(() => this.canEditSignal());
  taskSignal = signal<IWork | null>(null);
  task = computed(() => this.taskSignal());

  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());

  constructor() {
    this.route.paramMap
      .pipe(
        take(1),
        filter((params) => !!params.get('slug')),
        tap((params) => {
          this.taskSlug = params.get('slug')!;
        }),
      )
      .subscribe();

    effect(() => {
      this.reloadTaskTrigger();

      if (!this.taskSlug) return;

      merge(
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
      this.commentsCurrentPage.set(1);
    });
  }

  private applyWorkData(work: IWork): void {
    this.taskSignal.set(work);
    this.selectedWorkStatus.set((work.status as IProjectStatus) ?? null);
    this.workProjectStatuses.set((work.project.statuses as IProjectStatus[]) ?? []);
    this.selectedChangeType.set((work.type as IWorkType) ?? null);
    this.selectedChangePriority.set((work.priority as IWorkPriority) ?? null);
    this.selectedChangeEpic.set((work.epic as IWork) ?? null);
    this.workEpicTypeFilter.set({
      type: DefaultWorkTypesEnum.EPIC as number,
      project: work.project.id,
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
    if (button) {
      button.disabled = true;
    }
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

  private reloadCommentsTrigger = signal(0);
  commentsCurrentPage = signal(0);
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
              comment.changeChangeContent = comment.description;
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
    const created = new Date(comment.created)
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
    return false
  };
  createNewCommentMode = signal<boolean>(false);
  newCommentContent = signal<string>('');
  createComment(event: PointerEvent): void {
    if (!this.newCommentContent() || !this.canCreateComment() || !this.createNewCommentMode()) {
      this.newCommentContent.set('');
      this.createNewCommentMode.set(false);
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
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
      !comment.changeChangeContent ||
      !comment.changeMode ||
      !this.canCreateComment() ||
      !this.canEditComment(comment)
    ) {
      return;
    }
    this.workCommentService
      .patch(comment.slug, { description: comment.changeChangeContent })
      .pipe(
        take(1),
        tap((changedComment) => {
          comment.updated = changedComment.updated;
          comment.description = comment.changeChangeContent!;
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

  protected readonly ckeditorConfig = ckeditorConfig;
  protected readonly ckeditorCommentConfig = {
    ...ckeditorConfig,
    placeholder: 'Введите комментарий...',
  };
  protected readonly DefaultWorkTypesEnum = DefaultWorkTypesEnum;
}
