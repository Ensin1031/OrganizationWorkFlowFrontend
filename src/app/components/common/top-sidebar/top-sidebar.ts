import { Component, computed, inject, signal } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/select';
import { ProjectContextService } from '../../../services/project-context';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { IProject } from '../../../interfaces/project';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { take } from 'rxjs';
import { SafeSvgComponent } from '../safe-svg/safe-svg';
import { UserService } from '../../../services/user';
import { AuthService } from '../../../services/auth';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-top-sidebar',
  imports: [
    MatTooltip,
    MatIcon,
    MatMenu,
    MatDivider,
    MatMenuItem,
    RouterLink,
    MatMenuTrigger,
    MatLabel,
    MatFormField,
    MatInput,
    FormsModule,
    MatIconButton,
    SafeSvgComponent,
    NgOptimizedImage,
  ],
  templateUrl: './top-sidebar.html',
  styleUrl: './top-sidebar.scss',
})
export class TopSidebarComponent {
  protected projectService = inject(ProjectContextService);
  protected authService = inject(AuthService);
  protected userService = inject(UserService);
  private router = inject(Router);

  constructor() {
    this.projectService.getAllProjects().pipe(take(1)).subscribe();
  }

  searchText = signal('');
  filteredProjects = computed(() => {
    const projects = this.projectService.projects();
    const query = this.searchText().trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(query));
  });

  isProjectMenuOpen = false;
  onProjectMenuOpened() {
    this.isProjectMenuOpen = true;
  }
  onProjectMenuClosed() {
    this.isProjectMenuOpen = false;
  }
  selectProjectAndClearSearch(project: IProject): void {
    this.projectService.selectProject(project);
    this.searchText.set('');
    this.router.navigate(['/home/tasks'], { queryParams: { projectId: project.id } });
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/default-avatar.png';
  }
  openSettings(): void {
    this.router.navigate(['/home/user-profile']);
  }
  logout(): void {
    this.userService.clear();
    this.authService.logout();
  }
}
