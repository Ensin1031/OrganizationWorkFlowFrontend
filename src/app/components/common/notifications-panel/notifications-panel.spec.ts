import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsPanelComponent } from './notifications-panel';

describe('NotificationsPanelComponent', () => {
  let component: NotificationsPanelComponent;
  let fixture: ComponentFixture<NotificationsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
