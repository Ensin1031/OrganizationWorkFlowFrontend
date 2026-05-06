import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LeftSidebarWidthService } from '../../../services/left-sidebar-width';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

export interface ILinkItems {
  routerLink: string;
  svgIcon: string;
  routerLinkActive: string;
  title: string;
  tooltip: string;
}

@Component({
  selector: 'app-left-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIcon, MatTooltip],
  templateUrl: './left-sidebar.html',
  styleUrls: ['./left-sidebar.scss'],
})
export class LeftSidebarComponent {
  public sidebarService = inject(LeftSidebarWidthService);
  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  readonly EXPAND_THRESHOLD = 100;

  linkItems: ILinkItems[] = [
    {
      routerLink: '/home/user-table',
      routerLinkActive: 'active',
      svgIcon: 'mainSmallLightLogo',
      title: 'Главная',
      tooltip: 'Главная',
    },
    {
      routerLink: '/home/dashboard',
      routerLinkActive: 'active',
      svgIcon: 'dashboardIcon',
      title: 'Дашборд',
      tooltip: 'Дашборд',
    },
    {
      routerLink: '/home/tasks',
      routerLinkActive: 'active',
      svgIcon: 'tasksIcon',
      title: 'Задачи',
      tooltip: 'Задачи',
    },
    {
      routerLink: '/home/projects',
      routerLinkActive: 'active',
      svgIcon: 'projectsIcon',
      title: 'Проекты',
      tooltip: 'Проекты',
    },
    {
      routerLink: '/home/settings',
      routerLinkActive: 'active',
      svgIcon: 'settingsIcon',
      title: 'Настройки',
      tooltip: 'Настройки',
    },
  ];

  get isExpanded(): boolean {
    return this.sidebarService.currentWidth > this.EXPAND_THRESHOLD;
  }

  startResize(event: MouseEvent): void {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.sidebarService.currentWidth;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    const dx = event.clientX - this.startX;
    const newWidth = this.startWidth + dx;
    this.sidebarService.setWidth(newWidth);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isResizing = false;
  }
}
