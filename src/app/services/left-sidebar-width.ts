import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LeftSidebarWidthService {
  private readonly STORAGE_KEY = 'left_sidebar_width';
  private readonly DEFAULT_WIDTH = 260;
  private readonly MIN_WIDTH = 38;
  private readonly MAX_WIDTH = 500;

  private widthSignal = signal<number>(this.getInitialWidth());

  readonly width = this.widthSignal.asReadonly();
  get currentWidth(): number {
    return this.widthSignal();
  }

  setWidth(width: number) {
    const clamped = Math.max(this.MIN_WIDTH, Math.min(this.MAX_WIDTH, width));
    this.widthSignal.set(clamped);
    localStorage.setItem(this.STORAGE_KEY, String(clamped));
  }

  private getInitialWidth(): number {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= this.MIN_WIDTH && parsed <= this.MAX_WIDTH) {
        return parsed;
      }
    }
    return this.DEFAULT_WIDTH;
  }
}
