import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSprintUsersLoadDialogComponent } from './view-sprint-users-load';

describe('ViewSprintUsersLoadDialogComponent', () => {
  let component: ViewSprintUsersLoadDialogComponent;
  let fixture: ComponentFixture<ViewSprintUsersLoadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSprintUsersLoadDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSprintUsersLoadDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
