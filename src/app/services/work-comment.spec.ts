import { TestBed } from '@angular/core/testing';

import { WorkCommentService } from './work-comment';

describe('WorkCommentService', () => {
  let service: WorkCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkCommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
