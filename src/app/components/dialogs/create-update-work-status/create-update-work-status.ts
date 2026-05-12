import { Component, inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';
import { IStatus } from '../../../interfaces/references';
import { ClassicEditor } from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';

export interface IStatusCreateUpdateDialogData {
  mode: 'create' | 'edit';
  title: string;
  status?: IStatus;
}


@Component({
  selector: 'app-create-update-work-status',
  imports: [
    MatDialogActions,
    MatButton,
    MatInput,
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatLabel,
    SafeSvgComponent,
    CKEditorModule,
  ],
  templateUrl: './create-update-work-status.html',
  styleUrl: './create-update-work-status.scss',
})
export class CreateUpdateWorkStatusDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateWorkStatusDialogComponent>);
  public data = inject<IStatusCreateUpdateDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  public Editor = ClassicEditor;

  ngOnInit(): void {
    const status = this.data.status;
    this.form = this.fb.group({
      name: [status?.name || '', [Validators.required]],
      icon: [status?.icon || ''],
      color: [status?.color || '#4ECDC4'],
      description: [status?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    const payload = {
      ...this.form.value,
      id: this.data.status?.id,
    };
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  protected readonly ckeditorConfig = ckeditorConfig;
}
