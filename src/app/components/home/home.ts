import { Component, HostBinding, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from '../common/left-sidebar/left-sidebar';
import { TopSidebarComponent } from '../common/top-sidebar/top-sidebar';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [RouterOutlet, LeftSidebarComponent, TopSidebarComponent],
})
export class HomeComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
