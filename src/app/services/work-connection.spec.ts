import { TestBed } from '@angular/core/testing';

import { WorkConnectionService } from './work-connection';

describe('WorkConnectionService', () => {
  let service: WorkConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
