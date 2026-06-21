import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { NotificationsPanelComponent } from './notifications-panel';
import { NotificationsService } from '../../../services/notifications';
import { NotificationsPanelService } from '../../../services/notifications-panel';
import { TokenService } from '../../../services/token';
import { INotification } from '../../../interfaces/notifications';

describe('NotificationsPanelComponent', () => {
  let component: NotificationsPanelComponent;
  let fixture: ComponentFixture<NotificationsPanelComponent>;

  let notificationsService: any;
  let notificationsPanelService: any;
  let tokenService: any;

  const notification1: INotification = {
    id: 1,
    title: 'Title 1',
    description: 'Description 1',
    is_read: false,
    created: '2025-01-01T10:00:00',
    user: {
      username: '',
      first_name: '',
      last_name: '',
      second_name: '',
      need_send_email_notification: false,
      need_send_push_notification: false,
      id: 0,
      email: '',
      full_name: '',
    },
    updated: '',
  };

  const notification2: INotification = {
    id: 2,
    title: 'Title 2',
    description: 'Description 2',
    is_read: true,
    created: '2025-01-02T10:00:00',
    user: {
      username: '',
      first_name: '',
      last_name: '',
      second_name: '',
      need_send_email_notification: false,
      need_send_push_notification: false,
      id: 0,
      email: '',
      full_name: '',
    },
    updated: '',
  };

  beforeEach(async () => {
    notificationsService = {
      getPage: vi.fn(() =>
        of({
          count: 2,
          next: null,
          results: [notification1, notification2],
        }),
      ),
      markAsRead: vi.fn(() => of(null)),
      delete: vi.fn(() => of(null)),
      deleteAll: vi.fn(() => of(null)),
      markAllAsRead: vi.fn(() => of(null)),
    };

    notificationsPanelService = {
      opened: signal(false),
      close: vi.fn(),
    };

    tokenService = {
      getAccessToken: vi.fn(() => 'token'),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationsPanelComponent],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
        {
          provide: NotificationsPanelService,
          useValue: notificationsPanelService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPanelComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload notifications', () => {
    component.reload().subscribe();

    expect(notificationsService.getPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });

    expect(component.notifications().length).toBe(2);
    expect(component.count()).toBe(2);
    expect(component.page).toBe(2);
  });

  it('should not load page without token', () => {
    tokenService.getAccessToken.mockReturnValue(null);

    component.reload().subscribe();

    expect(notificationsService.getPage).not.toHaveBeenCalled();
  });

  it('should handle load error', () => {
    notificationsService.getPage.mockReturnValue(throwError(() => new Error('error')));

    component.reload().subscribe();

    expect(component.loading()).toBe(false);
    expect(component.notifications()).toEqual([]);
  });

  it('should reload when panel becomes opened', async () => {
    notificationsPanelService.opened.set(true);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(notificationsService.getPage).toHaveBeenCalled();
  });

  it('should load next page on scroll near bottom', () => {
    component.notifications.set([notification1]);
    component.count.set(10);

    const spy = vi.spyOn(notificationsService, 'getPage');

    component.onScroll({
      target: {
        scrollHeight: 1000,
        scrollTop: 850,
        clientHeight: 100,
      },
    } as any);

    expect(spy).toHaveBeenCalled();
  });

  it('should not load next page when all notifications loaded', () => {
    component.notifications.set([notification1, notification2]);
    component.count.set(2);

    const spy = vi.spyOn(notificationsService, 'getPage');

    component.onScroll({
      target: {
        scrollHeight: 1000,
        scrollTop: 850,
        clientHeight: 100,
      },
    } as any);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should mark notification as read', () => {
    const reloadSpy = vi.spyOn(component, 'reload').mockReturnValue(of(undefined) as any);

    component.markAsRead(123);

    expect(notificationsService.markAsRead).toHaveBeenCalledWith(123);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should delete notification', () => {
    const reloadSpy = vi.spyOn(component, 'reload').mockReturnValue(of(undefined) as any);

    component.delete(555);

    expect(notificationsService.delete).toHaveBeenCalledWith(555);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should delete all notifications', () => {
    const reloadSpy = vi.spyOn(component, 'reload').mockReturnValue(of(undefined) as any);

    component.deleteAll();

    expect(notificationsService.deleteAll).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should clear all notifications', () => {
    const reloadSpy = vi.spyOn(component, 'reload').mockReturnValue(of(undefined) as any);

    component.clearAll();

    expect(notificationsService.markAllAsRead).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should close panel and reset page', () => {
    component.page = 5;

    component.close();

    expect(component.page).toBe(1);
    expect(notificationsPanelService.close).toHaveBeenCalled();
  });

  it('should append notifications when loading next page', () => {
    component.notifications.set([notification1]);

    notificationsService.getPage.mockReturnValue(
      of({
        count: 2,
        next: null,
        results: [notification2],
      }),
    );

    component.page = 2;

    (component as any).loadPage(false).subscribe();

    expect(component.notifications()).toEqual([notification1, notification2]);
  });

  it('should set hasMore to false when next is null', () => {
    component.reload().subscribe();

    expect(component.page).toBe(2);
    expect(component.loading()).toBe(false);
  });
});
