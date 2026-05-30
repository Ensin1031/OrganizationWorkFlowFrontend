import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { INotification } from '../interfaces/notifications';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  private tokenService = inject(TokenService);

  private notifications = signal<INotification[]>([]);
  readonly data = this.notifications.asReadonly();

  connect(): void {
    const token = this.tokenService.getAccessToken();
    const socket = new WebSocket(`${environment.wsUrl}?token=${token}`);

    socket.onopen = () => console.log('OPEN');
    socket.onclose = (e) => console.log('CLOSE', e);
    socket.onerror = (e) => console.log('ERROR', e);

    socket.onmessage = (event) => {
      const notification: { type: string; items: INotification[], item: INotification } = JSON.parse(event.data);
      console.log('notification', notification);
      if (!!notification.items?.length) {
        this.notifications.update((items) => [...notification.items!, ...items]);
      } else if (!!notification.item) {
        this.notifications.update((items) => [notification.item, ...items]);
      }
      console.log('notifications', this.notifications());
    };

  }
}
