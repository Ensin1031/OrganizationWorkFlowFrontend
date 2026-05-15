import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatOption, MatSelect } from '@angular/material/select';
import { DefaultWorkTypesEnum, IWork, IWorkShort } from '../../../interfaces/works';
import {
  IReferenceCreateOrUpdate,
  IWorkDifficulty,
  IWorkPriority,
  IWorkTag,
  IWorkTechnology,
  IWorkType,
} from '../../../interfaces/references';
import {
  IProject,
  IProjectShort,
  IProjectStatus,
  IProjectStatusShort,
  IProjectVersion,
} from '../../../interfaces/project';
import { ISprint, ISprintShort } from '../../../interfaces/sprints';
import moment from 'moment';
import { ProjectContextService } from '../../../services/project-context';
import {
  WorkDifficultiesService,
  WorkPrioritiesService,
  WorkTagsService, WorkTechnologiesService,
  WorkTypesService,
} from '../../../services/work-references';
import { UserService } from '../../../services/user';
import { SprintService } from '../../../services/sprint';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { filter, finalize, merge, switchMap, take, tap } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { CreateUpdateReferenceDialogComponent, IReferenceCreateUpdateDialogConfig } from '../create-update-reference/create-update-reference';
import { WorkService } from '../../../services/work';
import { durationToMinutes, minutesToDuration } from '../../../utils/minutes-to-duration';
import { DurationMinutesDirective } from '../../../directives/duration-minutes';
import { ClassicEditor } from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';

export interface ICreateUpdateWorkDialogData {
  mode: 'create' | 'edit';
  title: string;
  work?: IWork;
  defaultData?: {
    epic?: IWork | IWorkShort | null;
    sprint?: ISprint | ISprintShort | null;
    project?: IProject | IProjectShort | null;
  };
  filters?: {
    types?: {
      without?: number | number[] | null;
      only?: number | number[] | null;
    };
  };
}


@Component({
  selector: 'app-create-update-work',
  imports: [
    MatDialogActions,
    MatButton,
    MatSuffix,
    MatInput,
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatLabel,
    MatError,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSelect,
    MatOption,
    EntitySelectComponent,
    MatIcon,
    MatIconButton,
    MatTooltip,
    DurationMinutesDirective,
    CKEditorModule,
  ],
  templateUrl: './create-update-work.html',
  styleUrl: './create-update-work.scss',
})
export class CreateUpdateWorkDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateWorkDialogComponent>);
  public data = inject<ICreateUpdateWorkDialogData>(MAT_DIALOG_DATA);

  private dialog = inject(MatDialog);

  protected projectService = inject(ProjectContextService);
  protected workTypesService = inject(WorkTypesService);
  protected prioritiesService = inject(WorkPrioritiesService);
  protected tagsService = inject(WorkTagsService);
  protected difficultiesService = inject(WorkDifficultiesService);
  protected technologiesService = inject(WorkTechnologiesService);
  protected sprintService = inject(SprintService);
  readonly loadSprintsPage = this.sprintService.getSprintPage.bind(this.sprintService);
  protected userService = inject(UserService);
  readonly loadExecuteByPage = this.userService.getUsers.bind(this.userService);

  protected workService = inject(WorkService);
  readonly loadEpicPage = this.workService.getWorkPage.bind(this.workService);
  workEpicTypeFilter = computed(() => {
    return {
      type: DefaultWorkTypesEnum.EPIC,
      project: this.selectedProjectIDSignal(),
    };
  });
  epicSelect = viewChild<EntitySelectComponent<IWork>>('epicSelect');

  defaultProject = computed(() => {
    const storageProjectId = this.projectService.storageSelectedProjectId;
    if (storageProjectId) {
      return this.projectService.projects().find((pr) => pr.id === storageProjectId) || null;
    }
    return null;
  });
  getSelectProjectDefaultStatus(project?: IProject | IProjectShort | null): IProjectStatus | null {
    if (!project?.statuses?.length) {
      return null;
    }
    return (project.statuses as IProjectStatus[]).reduce((min, current) =>
      current.priority < min.priority ? current : min,
    );
  }

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  readonly groupTypes = [DefaultWorkTypesEnum.EPIC as number, DefaultWorkTypesEnum.STORY as number];
  isGroupStatus = signal<boolean>(false);

  public Editor = ClassicEditor;

  compareById(obj1: any, obj2: any): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  ngOnInit(): void {
    merge(
      this.workTypesService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreateWorkType.set(canCreate)),
      ),
      this.prioritiesService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreatePriority.set(canCreate)),
      ),
      this.tagsService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreateTag.set(canCreate)),
      ),
      this.difficultiesService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreateWorkDifficulty.set(canCreate)),
      ),
      this.technologiesService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreateWorkTechnology.set(canCreate)),
      ),
    ).subscribe();
    const work = this.data.work;
    const defaultProject = (): IProject | IProjectShort | null => {
      return work?.project || this.data.defaultData?.project || this.defaultProject() || null;
    };
    this.projectsVersionsSignal.set(defaultProject()?.versions ?? []);
    this.selectedProjectIDSignal.set(defaultProject()?.id ?? null);
    this.form = this.fb.group({
      name: [work?.name || '', [Validators.required, Validators.maxLength(250)]],
      color: [work?.color || '#4ECDC4'],
      icon: [work?.icon || ''],
      start_date: [work?.start_date ? new Date(work.start_date) : null],
      end_date: [work?.end_date ? new Date(work.end_date) : null],
      target_start_date: [work?.target_start_date ? new Date(work.target_start_date) : null],
      target_end_date: [work?.target_end_date ? new Date(work.target_end_date) : null],
      lead_time: [durationToMinutes(work?.lead_time) || ''],
      wasted_time: [durationToMinutes(work?.wasted_time) || ''],
      epic: [work?.epic || this.data.defaultData?.epic || null],
      type: [work?.type || null, Validators.required],
      priority: [work?.priority || null],
      tags: [work?.tags || []],
      project: [defaultProject(), Validators.required],
      sprint: [work?.sprint || this.data.defaultData?.sprint || null],
      status: [
        work?.status || this.getSelectProjectDefaultStatus(defaultProject()) || null,
        Validators.required,
      ],
      created_by: [work?.created_by || null],
      execute_by: [work?.execute_by || null],
      difficulty: [work?.difficulty || null],
      technology: [work?.technology || null],
      versions: [work?.versions || []],
      histories: [work?.histories || []],
      description: [work?.description || ''],
    });

    if (this.data.mode === 'edit' && !!this.data.work && this.groupTypes.includes(this.data.work.type?.id ?? -1)) {
      this.isGroupStatus.set(true);
      ['type', 'epic', 'sprint'].forEach((field) => {
        this.form.get(field)?.disable();
      });
    }
    if (this.data.mode === 'edit') {
      ['project', 'created_by'].forEach((field) => {
        this.form.get(field)?.disable();
      });
    }
    if (this.data.defaultData?.epic) {
      this.form.get('epic')?.disable();
    }
    if (this.data.defaultData?.sprint) {
      this.form.get('sprint')?.disable();
    }
    if (this.data.defaultData?.project) {
      this.form.get('project')?.disable();
    }
    this.form
      .get('project')
      ?.valueChanges.pipe(
        tap((project: IProject) => {
          this.projectsVersionsSignal.set(project.versions);
          this.selectedProjectIDSignal.set(project.id);
          this.form.patchValue(
            {
              epic: null,
              status: !!project ? this.getSelectProjectDefaultStatus(project) : null,
              versions: [],
            },
            { emitEvent: false },
          );
        }),
        tap(() => {
          this.epicSelect()?.reload(null, this.workEpicTypeFilter());
        }),
      )
      .subscribe();

    this.form
      .get('type')
      ?.valueChanges.pipe(
        tap((type: IWorkType) => {
          this.isGroupStatus.set(this.groupTypes.includes(type.id));
          if (this.isGroupStatus()) {
            this.form.patchValue(
              {
                epic: null,
                sprint: null,
              },
              { emitEvent: false },
            );
          }
        }),
      )
      .subscribe();
  }

  getSelectProjectStatuses(): IProjectStatusShort[] {
    const selectedProject: IProject = this.form.get('project')?.value;
    if (selectedProject) {
      return selectedProject.statuses;
    }
    return [];
  }
  projectsVersionsSignal = signal<IProjectVersion[]>([]);
  selectedProjectIDSignal = signal<number | null>(null);
  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    const raw = this.form.getRawValue();
    const payload = {
      id: raw.id,
      name: raw.name,
      color: raw.color,
      icon: raw.icon,
      description: raw.description,
      start_date: raw.start_date ? moment(raw.start_date).format('YYYY-MM-DD') : null,
      end_date: raw.end_date ? moment(raw.end_date).format('YYYY-MM-DD') : null,
      target_start_date: raw.target_start_date
        ? moment(raw.target_start_date).format('YYYY-MM-DD')
        : null,
      target_end_date: raw.target_end_date
        ? moment(raw.target_end_date).format('YYYY-MM-DD')
        : null,
      lead_time: minutesToDuration(raw.lead_time),
      wasted_time: minutesToDuration(raw.wasted_time),
      epic_id: raw.epic?.id,
      type_id: raw.type?.id,
      priority_id: raw.priority?.id,
      histories_ids: raw.histories?.map((h: any) => h.id) || [],
      tags_ids: raw.tags?.map((t: any) => t.id) || [],
      project_id: raw.project?.id,
      sprint_id: raw.sprint?.id,
      status_id: raw.status?.id,
      created_by_id: raw.created_by?.id,
      execute_by_id: raw.execute_by?.id,
      difficulty_id: raw.difficulty?.id,
      technology_id: raw.technology?.id,
      versions_ids: raw.versions?.map((v: any) => v.id) || [],
    };
    if (this.data.mode === 'edit' && this.data.work) payload.id = this.data.work.id;
    this.dialogRef.close(payload);
    this.isSaving = false;
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  /** WorkTypes */
  readonly loadWorkTypesPage = this.workTypesService.getList.bind(this.workTypesService);
  canCreateWorkType = signal<boolean>(false);
  typeSelect = viewChild<EntitySelectComponent<IWorkType>>('typeSelect');
  createWorkType(event: PointerEvent): void {
    if (!this.canCreateWorkType()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateReferenceDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание типа работы',
        } as IReferenceCreateUpdateDialogConfig,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IWorkType) =>
          this.workTypesService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IWorkType) => {
          this.typeSelect()?.reload(result);
          this.form.get('type')?.setValue(result);
          this.form.get('type')?.markAsDirty();
          this.form.get('type')?.markAsTouched();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  /** Priorities */
  readonly loadPrioritiesPage = this.prioritiesService.getList.bind(this.prioritiesService);
  canCreatePriority = signal<boolean>(false);
  prioritySelect = viewChild<EntitySelectComponent<IWorkPriority>>('prioritySelect');
  createPriority(event: PointerEvent): void {
    if (!this.canCreatePriority()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateReferenceDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание приоритета работы',
        } as IReferenceCreateUpdateDialogConfig,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IWorkPriority) =>
          this.prioritiesService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IWorkPriority) => {
          this.prioritySelect()?.reload(result);
          this.form.get('priority')?.setValue(result);
          this.form.get('priority')?.markAsDirty();
          this.form.get('priority')?.markAsTouched();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  /** Tags */
  readonly loadTagsPage = this.tagsService.getList.bind(this.tagsService);
  canCreateTag = signal<boolean>(false);
  tagsSelect = viewChild<EntitySelectComponent<IWorkTag>>('tagsSelect');
  createTag(event: PointerEvent): void {
    if (!this.canCreateTag()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateReferenceDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание тэга работы',
        } as IReferenceCreateUpdateDialogConfig,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IWorkTag) =>
          this.tagsService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IWorkTag) => {
          this.tagsSelect()?.reload(result);
          this.form.get('tags')?.markAsDirty();
          this.form.get('tags')?.markAsTouched();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  /** Difficulty */
  readonly loadDifficultiesPage = this.difficultiesService.getList.bind(this.difficultiesService);
  canCreateWorkDifficulty = signal<boolean>(false);
  difficultySelect = viewChild<EntitySelectComponent<IWorkDifficulty>>('difficultySelect');
  createDifficulty(event: PointerEvent): void {
    if (!this.canCreateWorkDifficulty()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateReferenceDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание типа сложности работы',
        } as IReferenceCreateUpdateDialogConfig,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IWorkDifficulty) =>
          this.difficultiesService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IWorkDifficulty) => {
          this.difficultySelect()?.reload(result);
          this.form.get('difficulty')?.setValue(result);
          this.form.get('difficulty')?.markAsDirty();
          this.form.get('difficulty')?.markAsTouched();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  /** Technology */
  readonly loadTechnologiesPage = this.technologiesService.getList.bind(this.technologiesService);
  canCreateWorkTechnology = signal<boolean>(false);
  technologySelect = viewChild<EntitySelectComponent<IWorkTechnology>>('technologySelect');
  createTechnology(event: PointerEvent): void {
    if (!this.canCreateWorkTechnology()) {
      return;
    }
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateReferenceDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание типа технологии работы',
        } as IReferenceCreateUpdateDialogConfig,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IWorkTechnology) =>
          this.technologiesService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IWorkTechnology) => {
          this.technologySelect()?.reload(result);
          this.form.get('technology')?.setValue(result);
          this.form.get('technology')?.markAsDirty();
          this.form.get('technology')?.markAsTouched();
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  protected readonly ckeditorConfig = ckeditorConfig;
}
