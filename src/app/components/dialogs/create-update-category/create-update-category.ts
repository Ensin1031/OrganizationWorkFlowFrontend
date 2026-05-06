import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { IProjectCategory, IProjectType } from '../../../interfaces/project';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';
import { MatButton } from '@angular/material/button';

export interface IProjectMatObjectDialogData {
  mode: 'create' | 'edit';
  title: string;
  object?: IProjectCategory | IProjectType;
}


@Component({
  selector: 'app-create-update-project-mat-object-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    SafeSvgComponent,
    MatDialogActions,
    MatButton,
  ],
  templateUrl: './create-update-category.html',
  styleUrl: './create-update-category.scss',
})
export class CreateUpdateProjectMatObjectDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateProjectMatObjectDialogComponent>);
  public data = inject<IProjectMatObjectDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = false;

  title = signal('');

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.object?.name || '', [Validators.required, Validators.maxLength(30)]],
      icon: [this.data.object?.icon || ''],
      color: [this.data.object?.color || '#4ECDC4'],
      description: [this.data.object?.description || ''],
    });
    this.title.set(this.data.title)
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    this.dialogRef.close({ ...this.form.value, id: this.data.object?.id });
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
