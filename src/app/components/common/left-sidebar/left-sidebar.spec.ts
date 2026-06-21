import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSidebarComponent } from './left-sidebar';
import { provideRouter } from '@angular/router';

describe('LeftSidebarComponent', () => {
  let component: LeftSidebarComponent;
  let fixture: ComponentFixture<LeftSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftSidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
