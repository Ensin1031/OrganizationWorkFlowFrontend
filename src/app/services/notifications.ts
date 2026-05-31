import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  INotification,
  INotificationUnreadCount,
  IWSNotificationResponse,
} from '../interfaces/notifications';
import { TokenService } from './token';
import { HttpClient } from '@angular/common/http';
import { catchError, filter, Observable, of, tap } from 'rxjs';
import {
  buildHTTPParams,
  defaultEmptyPage,
  ISelectStrictPageQuery,
  PaginatedResponse,
} from '../interfaces/common';


@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private tokenService = inject(TokenService);

  private socket: WebSocket | null = null;

  private unreadCountData = signal<number>(0);
  readonly unreadCount = this.unreadCountData.asReadonly();
  private notifications = signal<INotification[]>([]);
  readonly data = this.notifications.asReadonly();

  connect(): void {
    const token = this.tokenService.getAccessToken();
    if (this.socket?.readyState === WebSocket.OPEN || !token) return;

    this.socket = new WebSocket(`${environment.wsUrl}?token=${token}`);
    this.socket.onopen = () => console.log('OPEN');
    this.socket.onclose = (e) => {
      console.log('CLOSE', e);
      this.socket = null;
    };
    this.socket.onerror = (e) => console.log('ERROR', e);

    this.socket.onmessage = (event) => {
      const notification: IWSNotificationResponse = JSON.parse(event.data);
      if (notification.unread_count !== undefined) {
        this.unreadCountData.set(notification.unread_count);
      }
      if (notification.items?.length) {
        this.notifications.update((items) => [...notification.items!, ...items]);
      }
      if (notification.item) {
        this.notifications.update((items) => [notification.item!, ...items]);
      }
    };
  }

  disconnect(): void {
    this.socket?.close(1000, 'logout');
    this.socket = null;

    this.notifications.set([]);
    this.unreadCountData.set(0);
  }

  setUnreadCount(response?: INotificationUnreadCount): void {
    let unread_count: number;
    if (!response?.unread_count) {
      unread_count = 0;
    } else {
      unread_count = response.unread_count;
    }
    this.unreadCountData.set(unread_count);
  }

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getPage(
    data: ISelectStrictPageQuery,
  ): Observable<PaginatedResponse<INotification> & INotificationUnreadCount> {
    const url = `${this.apiUrl}/notifications/`;
    return this.http
      .get<
        PaginatedResponse<INotification> & INotificationUnreadCount
      >(url, { params: buildHTTPParams(data) })
      .pipe(
        catchError(() => of({ ...defaultEmptyPage, unread_count: 0 })),
        tap((response) => this.setUnreadCount(response)),
      );
  }
  delete(id: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/notifications/${id}/`);
  }
  deleteAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notifications/delete-all/`, {});
  }
  getUnread(): Observable<INotificationUnreadCount> {
    return this.http
      .get<INotificationUnreadCount>(`${this.apiUrl}/notifications/unread/`)
      .pipe(tap((response) => this.setUnreadCount(response)));
  }

  markAsRead(id: number): Observable<INotification & INotificationUnreadCount> {
    return this.http
      .post<
        INotification & INotificationUnreadCount
      >(`${this.apiUrl}/notifications/${id}/mark-as-read/`, {})
      .pipe(tap((response) => this.setUnreadCount(response)));
  }

  markAllAsRead(): Observable<INotificationUnreadCount> {
    return this.http
      .post<INotificationUnreadCount>(`${this.apiUrl}/notifications/mark-all-as-read/`, {})
      .pipe(tap((response) => this.setUnreadCount(response)));
  }
}
