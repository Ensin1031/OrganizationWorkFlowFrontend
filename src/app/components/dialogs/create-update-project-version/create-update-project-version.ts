import { Component, inject, OnInit, signal } from '@angular/core';
import { IProjectVersion } from '../../../interfaces/project';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import moment from 'moment';
import { ClassicEditor } from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ckeditorConfig } from '../../../tokens/ckeditor-5-default-config';

export interface IProjectVersionCreateUpdateDialogData {
  mode: 'create' | 'edit';
  title: string;
  version?: IProjectVersion; // для редактирования
}


@Component({
  selector: 'app-create-update-project-version',
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
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    CKEditorModule,
  ],
  templateUrl: './create-update-project-version.html',
  styleUrl: './create-update-project-version.scss',
})
export class CreateUpdateProjectVersionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateProjectVersionDialogComponent>);
  public data = inject<IProjectVersionCreateUpdateDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  public Editor = ClassicEditor;

  ngOnInit(): void {
    const version = this.data.version;
    this.form = this.fb.group({
      name: [version?.name || '', [Validators.required]],
      start_date: [version?.start_date ? new Date(version.start_date) : null],
      end_date: [version?.end_date ? new Date(version.end_date) : null],
      color: [version?.color || '#4ECDC4'],
      description: [version?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    const raw = this.form.value;
    const payload: any = {
      ...raw,
      start_date: raw.start_date ? moment(raw.start_date).format('YYYY-MM-DD') : null,
      end_date: raw.end_date ? moment(raw.end_date).format('YYYY-MM-DD') : null,
      id: this.data.version?.id,
    };
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  protected readonly ckeditorConfig = ckeditorConfig;
}
