import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LeftSidebarWidthService } from '../../../services/left-sidebar-width';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NgClass } from '@angular/common';

export interface ILinkItems {
  routerLink: string;
  queryParams: Record<string, string | number | boolean>;
  children: ILinkItems[];
  svgIcon: string;
  routerLinkActive: string;
  title: string;
  tooltip: string;
}

@Component({
  selector: 'app-left-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgClass,
  ],
  templateUrl: './left-sidebar.html',
  styleUrls: ['./left-sidebar.scss'],
})
export class LeftSidebarComponent {
  private router = inject(Router);
  public sidebarService = inject(LeftSidebarWidthService);
  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  readonly EXPAND_THRESHOLD = 100;

  linkItems: ILinkItems[] = [
    {
      routerLink: '/home/user-table',
      queryParams: {},
      children: [],
      routerLinkActive: 'active',
      svgIcon: 'mainSmallLightLogo',
      title: 'Главная',
      tooltip: 'Главная',
    },
    {
      routerLink: '/home/dashboard',
      queryParams: {},
      children: [],
      routerLinkActive: 'active',
      svgIcon: 'dashboardIcon',
      title: 'Дашборд',
      tooltip: 'Дашборд',
    },
    {
      routerLink: '/home/tasks',
      queryParams: {},
      children: [
        {
          routerLink: '/home/tasks',
          queryParams: { byEpics: true },
          children: [],
          routerLinkActive: 'active',
          svgIcon: '',
          title: 'Задачи по эпикам',
          tooltip: 'Задачи по эпикам',
        },
        {
          routerLink: '/home/tasks',
          queryParams: { bySprints: true },
          children: [],
          routerLinkActive: 'active',
          svgIcon: '',
          title: 'Задачи по спринтам',
          tooltip: 'Задачи по спринтам',
        },
      ],
      routerLinkActive: 'active',
      svgIcon: 'tasksIcon',
      title: 'Задачи',
      tooltip: 'Задачи',
    },
    {
      routerLink: '/home/projects',
      queryParams: {},
      children: [],
      routerLinkActive: 'active',
      svgIcon: 'projectsIcon',
      title: 'Проекты',
      tooltip: 'Проекты',
    },
    {
      routerLink: '/home/settings',
      queryParams: {},
      children: [],
      routerLinkActive: 'active',
      svgIcon: 'settingsIcon',
      title: 'Настройки',
      tooltip: 'Настройки',
    },
  ];

  get isExpanded(): boolean {
    return this.sidebarService.currentWidth > this.EXPAND_THRESHOLD;
  }

  activeLink(item: ILinkItems): boolean {
    if (!Object.keys(item.queryParams).length) {
      const currentPath = this.router.url.split('?')[0];
      const itemPath = item.routerLink;
      return currentPath === itemPath;
    }
    const urlTree = this.router.createUrlTree([item.routerLink], { queryParams: item.queryParams });
    const currentUrl = this.router.url;
    return currentUrl === urlTree.toString();
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

  trackByIndex(index: number): number {
    return index;
  }
}
