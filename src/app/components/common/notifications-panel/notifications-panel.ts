import { Component, HostListener, inject, signal } from '@angular/core';
import { NotificationsService } from '../../../services/notifications';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NotificationsPanelService } from '../../../services/notifications-panel';
import { INotification } from '../../../interfaces/notifications';
import { catchError, EMPTY, filter, finalize, of, switchMap, take, tap } from 'rxjs';
import { TokenService } from '../../../services/token';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-notifications-panel',
  imports: [MatButton, DatePipe, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss',
})
export class NotificationsPanelComponent {
  readonly tokenService = inject(TokenService);
  readonly notificationsService = inject(NotificationsService);
  private notificationsPanelService = inject(NotificationsPanelService);

  readonly notifications = signal<INotification[]>([]);
  readonly loading = signal(false);
  private hasMore = signal(true);
  readonly count = signal(0);

  page = 1;
  readonly pageSize = 20;

  constructor() {
    toObservable(this.notificationsPanelService.opened)
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => {
        this.reload()?.subscribe();
      });
  }

  reload() {
    this.page = 1;
    return this.loadPage(true);
  }

  private loadPage(reset = false) {
    if (this.loading() || !this.tokenService.getAccessToken()) return EMPTY;

    this.loading.set(true);

    return this.notificationsService
      .getPage({
        page: this.page,
        pageSize: this.pageSize,
      })
      .pipe(
        take(1),
        catchError(() => {
          this.loading.set(false);
          return EMPTY;
        }),
        filter((response) => !!response),
        tap((response) => {
          this.count.set(response.count);
          if (reset) {
            this.notifications.set(response.results);
          } else {
            this.notifications.update((items) => [...items, ...response.results]);
          }
          this.page++;
          this.hasMore.set(!!response.next);
          this.loading.set(false);
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    const loadedAll = this.notifications().length >= this.count();
    if (nearBottom && !loadedAll && this.hasMore()) {
      this.loadPage();
    }
  }

  markAsRead(notificationId: number): void {
    this.notificationsService
      .markAsRead(notificationId)
      .pipe(
        take(1),
        switchMap(() => this.reload()),
      )
      .subscribe();
  }
  delete(notificationId: number): void {
    this.notificationsService
      .delete(notificationId)
      .pipe(
        take(1),
        switchMap(() => this.reload()),
      )
      .subscribe();
  }
  deleteAll(): void {
    this.notificationsService
      .deleteAll()
      .pipe(
        take(1),
        switchMap(() => this.reload()),
      )
      .subscribe();
  }
  clearAll(): void {
    this.notificationsService
      .markAllAsRead()
      .pipe(
        take(1),
        switchMap(() => this.reload()),
      )
      .subscribe();
  }
  close(): void {
    this.page = 1;
    this.notificationsPanelService.close();
  }
}
