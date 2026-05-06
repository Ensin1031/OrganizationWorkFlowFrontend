import { Component, inject, OnInit, signal } from '@angular/core';
import { IReferenceCreateOrUpdate, IReferenceMixin } from '../../../interfaces/references';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { SafeSvgComponent } from '../../common/safe-svg/safe-svg';

export interface IReferenceCreateUpdateDialogConfig {
  mode: 'create' | 'edit' | 'view';
  title: string;
  reference?: IReferenceMixin;
}


@Component({
  selector: 'app-create-update-reference',
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
    MatError,
    SafeSvgComponent,
  ],
  templateUrl: './create-update-reference.html',
  styleUrl: './create-update-reference.scss',
})
export class CreateUpdateReferenceDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUpdateReferenceDialogComponent>);
  public data = inject<IReferenceCreateUpdateDialogConfig>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = false;
  title = signal(this.data.title);

  ngOnInit(): void {
    const ref = this.data.reference;
    this.form = this.fb.group({
      name: [ref?.name || '', Validators.required],
      icon: [ref?.icon || ''],
      color: [ref?.color || '#4ECDC4'],
      description: [ref?.description || ''],
    });
    if (this.data.mode === 'view') {
      this.form.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.data.mode === 'view') return;
    this.isSaving = true;
    const value = this.form.value;
    const payload: IReferenceCreateOrUpdate & { id?: number } = {
      name: value.name,
      color: value.color,
      icon: value.icon,
      description: value.description,
    };
    if (this.data.mode === 'edit' && this.data.reference?.id) {
      payload.id = this.data.reference.id;
    }
    this.dialogRef.close(payload);
    this.isSaving = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
