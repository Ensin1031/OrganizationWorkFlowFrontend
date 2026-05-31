import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { NotificationsService } from './services/notifications';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { NotificationsPanelComponent } from './components/common/notifications-panel/notifications-panel';
import { NotificationsPanelService } from './services/notifications-panel';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    NotificationsPanelComponent,
  ],
  template: `
    <router-outlet></router-outlet>
    <mat-drawer-container class="app-container" (backdropClick)="notificationsPanelClose()">
      <mat-drawer #notificationsDrawer position="end" mode="over" class="notifications-drawer">
        <app-notifications-panel />
      </mat-drawer>
      <mat-drawer-content>
        <router-outlet />
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  protected readonly title = signal('organization-workflow-frontend');

  notificationService = inject(NotificationsService);

  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  private notificationsPanelService = inject(NotificationsPanelService);
  notificationsDrawer = viewChild<MatDrawer>('notificationsDrawer');
  notificationsPanelClose = () => this.notificationsPanelService.close();

  constructor() {
    effect(() => {
      if (this.notificationsPanelService.opened()) {
        this.notificationsDrawer()?.open();
      } else {
        this.notificationsDrawer()?.close();
      }
    });
  }

  ngOnInit(): void {
    this.notificationService.connect();
    this.matIconRegistry
      .addSvgIcon(
        'mainSmallLogo',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/small-logo.svg'),
      )
      .addSvgIcon(
        'mainSmallLightLogo',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/small-logo-light.svg'),
      )
      .addSvgIcon(
        'notificationIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/notification.svg'),
      )
      .addSvgIcon(
        'notificationRingIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/notification-ring.svg'),
      )
      .addSvgIcon(
        'dashboardIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/dashboard.svg'),
      )
      .addSvgIcon(
        'tasksIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/tasks.svg'),
      )
      .addSvgIcon(
        'activeTasksIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/active_tasks.svg'),
      )
      .addSvgIcon(
        'userTasksIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/user_tasks.svg'),
      )
      .addSvgIcon(
        'projectsListIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/projects_list.svg'),
      )
      .addSvgIcon(
        'projectsIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/projects.svg'),
      )
      .addSvgIcon(
        'addObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/add-object.svg'),
      )
      .addSvgIcon(
        'editObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edit-object.svg'),
      )
      .addSvgIcon(
        'delObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/del-object.svg'),
      )
      .addSvgIcon(
        'shapeOnIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/shape-on-green-icon.svg'),
      )
      .addSvgIcon(
        'settingsIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/settings.svg'),
      );
  }
}
