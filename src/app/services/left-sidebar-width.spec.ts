import { TestBed } from '@angular/core/testing';

import { LeftSidebarWidthService } from './left-sidebar-width';

describe('LeftSidebarWidthService', () => {
  let service: LeftSidebarWidthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeftSidebarWidthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
