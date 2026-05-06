import { TestBed } from '@angular/core/testing';

import { WorkReferencesService } from './work-references';

describe('WorkReferencesService', () => {
  let service: WorkReferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkReferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
