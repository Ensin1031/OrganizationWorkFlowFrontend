import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  ISprint,
  ISprintLoadWithoutUsers,
  IUserSprintLoad,
} from '../../../interfaces/sprints';
import { FiltersType } from '../../../interfaces/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { SprintService } from '../../../services/sprint';
import { take, tap } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { DurationHumanizePipe } from '../../../pipes/duration-humanize-pipe';
import { UserPhotoViewComponent } from '../../common/user-photo-view/user-photo-view';
import { NgClass } from '@angular/common';

export interface IViewSprintUsersLoadDialogData {
  sprint: ISprint,
  filters?: FiltersType | null,
}


@Component({
  selector: 'app-view-sprint-users-load',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    DurationHumanizePipe,
    UserPhotoViewComponent,
    NgClass,
  ],
  template: `
    <h2 mat-dialog-title>Нагрузка на пользователей по спринту</h2>
    <mat-dialog-content>
      <div class="d-flex flex-column gap-2 users-data-content">
        @if (hasUsersContent()) {
          <div class="d-flex flex-column gap-2">
            @for (user of usersData(); track user.user_id) {
              <div
                class="d-flex flex-row align-items-center justify-content-between position-relative"
              >
                <div class="d-flex flex-row align-items-center gap-2">
                  @if (user.user_photo) {
                    <div class="d-flex flex-row align-items-center position-relative photo-content">
                      <app-user-photo-view
                        [tooltip]="user?.user_email ?? ''"
                        [photoUrl]="user.user_photo"
                      ></app-user-photo-view>
                    </div>
                  }
                  <div class="hide-text-overflow-1">{{ user.user_full_name }}</div>
                </div>
                <div class="text-nowrap lead-time">
                  {{ user.user_lead_time | durationHumanize }}
                </div>
              </div>
            }
          </div>
        }
        @if (hasWithoutUsersDataContent()) {
          <div
            class="d-flex flex-row align-items-center justify-content-between without-users-content"
          >
            <div [ngClass]="{ 'without-users-title': hasUsersContent() }">
              Не распределенных задач
            </div>
            <div class="text-nowrap lead-time">
              {{ withoutUsersData()!.total_lead_time | durationHumanize }}
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Ок</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .photo-content {
        width: 2rem;
        height: 2rem;
      }
      .users-data-content {
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: var(--bs-white);
      }
      .without-users-content {
        min-height: 2rem;
      }
      .without-users-title {
        margin-left: 2.6rem;
      }
      .lead-time {
        min-width: 4.225rem;
        text-align: right;
      }
    `,
  ],
})
export class ViewSprintUsersLoadDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ViewSprintUsersLoadDialogComponent>);
  public data = inject<IViewSprintUsersLoadDialogData>(MAT_DIALOG_DATA);

  protected sprintService = inject(SprintService);

  usersDataSignal = signal<IUserSprintLoad[]>([]);
  usersData = computed((): IUserSprintLoad[] => this.usersDataSignal());
  withoutUsersDataSignal = signal<ISprintLoadWithoutUsers | null>(null);
  withoutUsersData = computed((): ISprintLoadWithoutUsers | null => this.withoutUsersDataSignal());

  hasUsersContent = computed((): boolean => {
    return !!this.usersData() && this.usersData().length > 0;
  });
  hasWithoutUsersDataContent = computed((): boolean => {
    const withoutUsersData = this.withoutUsersData();
    return !!withoutUsersData?.total_lead_time && withoutUsersData.total_lead_time !== '00:00:00';
  });

  ngOnInit(): void {
    this.sprintService
      .getSprintUsersLoad(this.data.sprint.slug, this.data.filters)
      .pipe(
        take(1),
        tap((data) => {
          this.usersDataSignal.set(data.users);
          this.withoutUsersDataSignal.set(data.without_users ?? null);
        }),
      )
      .subscribe();
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
