import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  IProject,
  IProjectCategory,
  IProjectType,
  IProjectVersion,
  IProjectVersionCreateOrUpdate,
} from '../../../interfaces/project';
import { MatTooltip } from '@angular/material/tooltip';
import {
  CreateUpdateProjectVersionDialogComponent,
  IProjectVersionCreateUpdateDialogData,
} from '../create-update-project-version/create-update-project-version';
import { filter, finalize, merge, switchMap, take, tap } from 'rxjs';
import { ProjectContextService } from '../../../services/project-context';
import { IReferenceCreateOrUpdate, IStatus } from '../../../interfaces/references';
import {
  CreateUpdateWorkStatusDialogComponent,
  IStatusCreateUpdateDialogData,
} from '../create-update-work-status/create-update-work-status';
import { StatusesService } from '../../../services/work-references';
import {
  CreateUpdateProjectMatObjectDialogComponent,
  IProjectMatObjectDialogData
} from '../create-update-category/create-update-category';
import moment from 'moment';
import { UserService } from '../../../services/user';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { ClassicEditor } from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';

export interface IProjectCreateUpdateDialogData {
  mode: 'create' | 'edit' | 'view';
  project?: IProject; // для редактирования
  availableVersions: IProjectVersion[];
  availableCategories?: IProjectCategory[];
  availableTypes?: IProjectType[];
}


@Component({
  selector: 'app-create-update-project',
  imports: [
    MatDialogActions,
    MatButton,
    MatIcon,
    MatIconButton,
    MatSuffix,
    MatInput,
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatLabel,
    MatError,
    SafeSvgComponent,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatTooltip,
    EntitySelectComponent,
    CKEditorModule,
  ],
  templateUrl: './create-update-project.html',
  styleUrl: './create-update-project.scss',
})
export class CreateUpdateProjectDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateProjectDialogComponent>);
  public data = inject<IProjectCreateUpdateDialogData>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  protected projectService = inject(ProjectContextService);
  protected statusesService = inject(StatusesService);
  readonly loadStatusesPage = this.statusesService.getList.bind(this.statusesService);
  protected userService = inject(UserService);
  readonly loadExecuteByPage = this.userService.getUsers.bind(this.userService);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.mode === 'create' ? 'Создание проекта' : (this.data.mode === 'edit' ? 'Редактирование проекта' : 'Просмотр проекта'));

  public Editor = ClassicEditor;

  get urls() {
    return this.form.get('urls') as FormArray;
  }

  get urlsControls() {
    return this.urls.controls as FormControl[];
  }

  compareById(obj1: any, obj2: any): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  ngOnInit(): void {
    merge(
      this.statusesService.getCanCreate().pipe(
        take(1),
        tap((canCreate) => this.canCreateStatus.set(canCreate)),
      ),
    ).subscribe();
    const project = this.data.project;
    this.form = this.fb.group({
      name: [project?.name || '', [Validators.required, Validators.maxLength(40)]],
      code_prefix: [project?.code_prefix || '', Validators.maxLength(10)],
      icon: [project?.icon || ''],
      color: [project?.color || '#4ECDC4'],
      start_date: [project?.start_date ? new Date(project.start_date) : null],
      end_date: [project?.end_date ? new Date(project.end_date) : null],
      category: [project?.category || null],
      type: [project?.type || null],
      manage_by: [project?.manage_by || null],
      statuses: [project?.statuses || []],
      statuses_map: [[]],
      active_version: [project?.active_version || null],
      versions: [project?.versions || []],
      description: [project?.description || ''],
      urls: this.fb.array(project?.urls?.map((u) => this.fb.control(u)) || []),
    });
    if (this.data.mode === 'view') {
      this.form.disable();
    }
  }

  addUrlField() {
    this.urls.push(this.fb.control(''));
  }
  removeUrlField(index: number) {
    this.urls.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSaving = true;
    const raw = this.form.value;

    const payload: any = {
      ...raw,
      start_date: raw.start_date ? moment(raw.start_date).format('YYYY-MM-DD') : null,
      end_date: raw.end_date ? moment(raw.end_date).format('YYYY-MM-DD') : null,
      urls: raw.urls.filter((u: string) => u?.trim() !== ''),
      category_id: raw.category?.id,
      type_id: raw.type?.id,
      manage_by_id: raw.manage_by?.id,
      set_active_version: raw.active_version,
      status_ids: raw.statuses_map?.map((s: IStatus) => s.id) || [],
    };
    if (this.data.mode === 'edit' && this.data.project) payload.id = this.data.project.id;
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel() {
    this.dialogRef.close();
  }
  createProjectType(event: PointerEvent): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание типа проекта',
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectType) => this.projectService.createProjectType(result)),
        tap((result: IProjectType) => {
          setTimeout(() => {
            this.data.availableTypes = [...(this.data.availableTypes || []), result];
            if (this.data.project) {
              this.data.project.type = result;
            }
            this.form.get('type')?.setValue(result, { emitEvent: false });
          }, 100);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  createProjectCategory(event: PointerEvent): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    this.dialog
      .open(CreateUpdateProjectMatObjectDialogComponent, {
        width: '500px',
        data: {
          mode: 'create',
          title: 'Создание категории проекта',
        } as IProjectMatObjectDialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result: IProjectCategory) => this.projectService.createProjectCategory(result)),
        tap((result: IProjectType) => {
          setTimeout(() => {
            this.data.availableCategories = [...(this.data.availableCategories || []), result];
            if (this.data.project) {
              this.data.project.category = result;
            }
            this.form.get('category')?.setValue(result, { emitEvent: false });
          }, 100);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  createVersion(event: PointerEvent): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    const dialogData: IProjectVersionCreateUpdateDialogData = {
      mode: 'create',
      title: 'Создание версии проекта',
    };
    this.dialog
      .open(CreateUpdateProjectVersionDialogComponent, {
        width: '500px',
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
        switchMap((result: IProjectVersion) =>
          this.projectService.createProjectVersion({
            ...result,
            project_id: this.data.project?.id,
          } as IProjectVersionCreateOrUpdate),
        ),
        tap((result: IProjectVersion) => {
          setTimeout(() => {
            this.data.availableVersions = [...this.data.availableVersions, result];
            if (this.data.project) {
              this.data.project.active_version = result;
            }
            this.form.get('active_version')?.setValue(result, { emitEvent: false });
          }, 100);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  canCreateStatus = signal<boolean>(false);
  statusesMapSelect = viewChild<EntitySelectComponent<IStatus>>('statusesMapSelect');
  createStatus(event: PointerEvent): void {
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    const dialogData: IStatusCreateUpdateDialogData = {
      mode: 'create',
      title: 'Создание статуса',
    };
    this.dialog
      .open(CreateUpdateWorkStatusDialogComponent, {
        width: '500px',
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
        switchMap((result: IStatus) =>
          this.statusesService.create(result as IReferenceCreateOrUpdate),
        ),
        tap((result: IStatus) => {
          this.statusesMapSelect()?.reload(result);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }
  statusesOnLoad(data: { value: IStatus | IStatus[] | null; items: IStatus[] }): void {
    const value = data.value;
    const selectedStatuses = () => {
      const result: IStatus[] = [];
      if (value && Array.isArray(value) && value.length > 0) {
        value.forEach((item) => {
          const findStatus = data.items.find((s) => s.id === item.id);
          if (findStatus) {
            result.push(findStatus);
          }
        });
      } else if (value && !Array.isArray(value)) {
        const findStatus = data.items.find((s) => s.id === value.id);
        if (findStatus) {
          result.push(findStatus);
        }
      } else {
        const projectStatuses = this.data.project?.statuses;
        if (projectStatuses && projectStatuses.length > 0) {
          projectStatuses.forEach((item) => {
            const findStatus = data.items.find((s) => s.id === item.status);
            if (findStatus) {
              result.push(findStatus);
            }
          });
        }
      }
      return result;
    };
    this.statusesMapSelect()?.select(selectedStatuses());
  }

  protected readonly ckeditorConfig = ckeditorConfig;
}
