import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface ISetDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'warn' | 'accent';
}


@Component({
  selector: 'app-confirmation',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
  template: `
    @if (data.title) {
      <h2 mat-dialog-title>{{ data.title }}</h2>
    }
    @if (data.message) {
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
    }
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText || 'Отмена' }}</button>
      <button mat-flat-button [color]="data.color || 'warn'" (click)="onConfirm()">
        {{ data.confirmText || 'Подтвердить' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 300px;
        max-width: 500px;
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  private dialogRef = inject(MatDialogRef<ISetDialogData>);
  public data = inject<ISetDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
