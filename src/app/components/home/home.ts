import { Component, HostBinding, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [MatIcon, MatTooltip, RouterOutlet],
})
export class HomeComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
