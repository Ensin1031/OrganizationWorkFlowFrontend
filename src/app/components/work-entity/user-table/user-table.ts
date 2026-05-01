import { Component, HostBinding, inject } from '@angular/core';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-user-table',
  imports: [],
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTableComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
