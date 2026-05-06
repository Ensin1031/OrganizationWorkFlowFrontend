import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ISetDialogData } from '../confirmation/confirmation';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-alert',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="onConfirm()">
        {{ data.cancelText || 'ОК' }}
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
export class AlertComponent {
  private dialogRef = inject(MatDialogRef<ISetDialogData>);
  public data = inject<ISetDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(false);
  }
}
