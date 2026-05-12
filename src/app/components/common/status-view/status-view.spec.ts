import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusViewComponent } from './status-view';

describe('StatusViewComponent', () => {
  let component: StatusViewComponent;
  let fixture: ComponentFixture<StatusViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
