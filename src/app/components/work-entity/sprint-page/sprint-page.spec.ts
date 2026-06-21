import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SprintPageComponent } from './sprint-page';
import { SprintService } from '../../../services/sprint';
import { WorkService } from '../../../services/work';

describe('SprintPageComponent', () => {
  let component: SprintPageComponent;
  let fixture: ComponentFixture<SprintPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintPageComponent],
      providers: [
        provideRouter([]),

        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ slug: 'test-sprint' }),
            snapshot: {
              params: {
                slug: 'test-sprint',
              },
            },
          },
        },

        {
          provide: SprintService,
          useValue: {
            getCanEdit: () => of(true),
            getSprint: () =>
              of({
                id: 1,
                slug: 'test-sprint',
                name: 'Test sprint',
                works_ids: [],
              }),
          },
        },

        {
          provide: WorkService,
          useValue: {
            getCanCreateTask: () => of(true),
            getWorkPage: () =>
              of({
                count: 0,
                next: null,
                previous: null,
                results: [],
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
