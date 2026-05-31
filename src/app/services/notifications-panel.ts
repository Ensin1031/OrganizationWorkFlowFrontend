import { Injectable, signal } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class NotificationsPanelService {
  private readonly openedSignal = signal(false);
  readonly opened = this.openedSignal.asReadonly();
  open() {
    this.openedSignal.set(true);
  }
  close() {
    this.openedSignal.set(false);
  }
  toggle() {
    this.openedSignal.update((v) => !v);
  }
}
