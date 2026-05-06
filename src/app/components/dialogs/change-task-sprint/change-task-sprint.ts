import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { IWork } from '../../../interfaces/works';
import { SprintService } from '../../../services/sprint';
import { EntitySelectComponent } from '../../common/entity-select/entity-select';
import { MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

export interface IChangeTaskSprintDialogData {
  mode: 'add' | 'change';
  title: string;
  task: IWork;
}


@Component({
  selector: 'app-change-task-sprint',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    EntitySelectComponent,
    ReactiveFormsModule,
    MatError,
    MatDialogActions,
    MatButton,
  ],
  templateUrl: './change-task-sprint.html',
  styleUrl: './change-task-sprint.scss',
})
export class ChangeTaskSprintDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangeTaskSprintDialogComponent>);
  public data = inject<IChangeTaskSprintDialogData>(MAT_DIALOG_DATA);

  private sprintService = inject(SprintService);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  ngOnInit(): void {
    const task = this.data.task;
    const validators = this.data.mode === 'add' ? [Validators.required] : [];
    this.form = this.fb.group({
      sprint: [task.sprint || null, validators],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    const payload = {
      sprint_id: this.form.value.sprint?.id || null,
    };
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  loadSprintsPage(params: { page: number; pageSize: number; search?: string }) {
    const projectId = this.data.task.project?.id;
    const filters: any = { is_completed: false };
    if (projectId) filters.project_id = projectId;
    return this.sprintService.getSprintPage({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      filters,
      ordering: 'start_date',
    });
  }
}
