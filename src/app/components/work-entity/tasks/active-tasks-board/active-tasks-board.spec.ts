import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTasksBoardComponent } from './active-tasks-board';

describe('ActiveTasksBoardComponent', () => {
  let component: ActiveTasksBoardComponent;
  let fixture: ComponentFixture<ActiveTasksBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveTasksBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveTasksBoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
