import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/select';
import { ProjectContextService } from '../../../services/project-context';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { IProject } from '../../../interfaces/project';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { catchError, EMPTY, filter, finalize, merge, switchMap, take, tap } from 'rxjs';
import { SafeSvgComponent } from '../safe-svg/safe-svg';
import { UserService } from '../../../services/user';
import { AuthService } from '../../../services/auth';
import { NgOptimizedImage } from '@angular/common';
import { WorkService } from '../../../services/work';
import { CreateUpdateWorkDialogComponent, ICreateUpdateWorkDialogData } from '../../dialogs/create-update-work/create-update-work';
import { IWorkCreateOrUpdate } from '../../../interfaces/works';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationsService } from '../../../services/notifications';


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
    MatButton,
    MatSuffix,
  ],
  templateUrl: './top-sidebar.html',
  styleUrl: './top-sidebar.scss',
})
export class TopSidebarComponent {
  private dialog = inject(MatDialog);

  protected notificationsService = inject(NotificationsService);
  protected projectService = inject(ProjectContextService);
  protected workService = inject(WorkService);
  protected authService = inject(AuthService);
  protected userService = inject(UserService);
  private router = inject(Router);

  canCreateTask = signal<boolean>(false);

  errorSignal = signal<string>('');
  error = computed(() => this.errorSignal());

  searchTextPage = signal('');
  goToSearchPage(): void {
    const urlTree = this.router.createUrlTree(['/home/search'], {
      queryParams: { search: this.searchTextPage() || undefined },
    });
    window.open(this.router.serializeUrl(urlTree), '_blank');
  }

  constructor() {
    effect(() => {
      merge(
        this.workService.getCanCreateTask().pipe(
          take(1),
          tap((canCreate) => this.canCreateTask.set(canCreate)),
        ),
        this.projectService.getAllProjects(),
      ).subscribe();
    });
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
    this.router.navigate(['/home/projects', project.slug]);
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/icons/small-logo-light.svg';
  }
  openSettings(): void {
    this.router.navigate(['/home/user-profile']);
  }
  logout(): void {
    this.userService.clear();
    this.authService.logout();
  }

  createTask(event: PointerEvent): void {
    if (!this.canCreateTask()) return;
    const button = (event.target as HTMLButtonElement).closest('button');
    if (button) button.disabled = true;
    const user = this.userService.user();
    const dialogData: ICreateUpdateWorkDialogData = {
      mode: 'create',
      title: 'Создание задачи',
      defaultData: {
        // epic: this.task(),
        // project: this.task()?.project,
      },
      filters: {
        // types: { without: [DefaultWorkTypesEnum.EPIC, DefaultWorkTypesEnum.STORY] },
      },
      work: undefined,
    };
    this.dialog
      .open(CreateUpdateWorkDialogComponent, {
        width: '700px',
        data: dialogData,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          if (button) button.disabled = false;
        }),
        filter((result) => !!result),
        switchMap((result) =>
          this.workService.createWork({
            ...result,
            created_by_id: user?.id,
          } as IWorkCreateOrUpdate),
        ),
        catchError((error: HttpErrorResponse) => {
          const backendError = error.error;
          if (backendError && typeof backendError === 'object') {
            const messages: string[] = [];
            Object.values(backendError).forEach((value) => {
              if (Array.isArray(value)) {
                messages.push(...value.map(String));
              } else if (value) {
                messages.push(String(value));
              }
            });
            this.errorSignal.set(messages.join('\n'));
          } else {
            this.errorSignal.set('Произошла ошибка');
          }
          if (button) button.disabled = false;
          return EMPTY;
        }),
        filter((result) => !!result),
        tap((result) => {
          this.router.navigate(['/home/tasks', result.slug]);
        }),
        finalize(() => {
          if (button) button.disabled = false;
        }),
      )
      .subscribe();
  }

  notificationsView(): void {
    console.log('notificationsView ===', this.notificationsService.data());
  };
}
