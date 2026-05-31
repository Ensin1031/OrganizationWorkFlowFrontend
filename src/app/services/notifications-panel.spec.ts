import { TestBed } from '@angular/core/testing';

import { NotificationsPanelService } from './notifications-panel';

describe('NotificationsPanelService', () => {
  let service: NotificationsPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
