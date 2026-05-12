import { Component, inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ISprint, ISprintCreateOrUpdate } from '../../../interfaces/sprints';
import moment from 'moment';

export interface ISprintCreateUpdateDialogData {
  mode: 'create' | 'edit' | 'view';
  title: string;
  sprint?: ISprint;
}


@Component({
  selector: 'app-create-update-sprint',
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
  ],
  templateUrl: './create-update-sprint.html',
  styleUrl: './create-update-sprint.scss',
})
export class CreateUpdateSprintDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateSprintDialogComponent>);
  public data = inject<ISprintCreateUpdateDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  ngOnInit(): void {
    const sprint = this.data.sprint;
    this.form = this.fb.group({
      name: [sprint?.name || '', [Validators.required, Validators.maxLength(250)]],
      color: [sprint?.color || '#4ECDC4'],
      start_date: [sprint?.start_date ? new Date(sprint.start_date) : null, Validators.required],
      end_date: [sprint?.end_date ? new Date(sprint.end_date) : null, Validators.required],
      in_work: [sprint?.in_work || false],
      is_completed: [sprint?.is_completed || false],
      description: [sprint?.description || ''],
    });
    if (this.data.mode === 'view') {
      this.form.disable()
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    const raw = this.form.value;
    const payload: ISprintCreateOrUpdate = {
      name: raw.name,
      color: raw.color,
      start_date: raw.start_date ? moment(raw.start_date).format('YYYY-MM-DD') : '',
      end_date: raw.end_date ? moment(raw.end_date).format('YYYY-MM-DD') : '',
      in_work: raw.in_work,
      is_completed: raw.is_completed,
      description: raw.description,
    };
    if (this.data.mode === 'edit' && this.data.sprint) {
      (payload as any).id = this.data.sprint.id;
    }
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
