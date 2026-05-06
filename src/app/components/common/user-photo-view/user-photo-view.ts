import { Component, HostBinding, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-photo-view',
  imports: [NgOptimizedImage, MatTooltip],
  template: `
    @if (photoUrl()) {
      <img
        [matTooltip]="tooltip()"
        [matTooltipShowDelay]="500"
        [ngSrc]="photoUrl()"
        alt="avatar"
        class="user-avatar"
        fill
      />
    }
  `,
  styles: [
    `
      .user-avatar {
        border: 1px solid var(--gray-dark-background-color);
        box-shadow:
          0 0 8px rgba(0, 0, 0, 0.1),
          0 0 0 1px rgba(0, 0, 0, 0.02);
        border-radius: 50%;
        object-fit: cover;
        position: static !important;
      }
    `,
  ],
})
export class UserPhotoViewComponent {
  @HostBinding('class') class = 'h-100 w-100 d-flex';
  tooltip = input<string>('');
  photoUrl = input.required<string>();
}
