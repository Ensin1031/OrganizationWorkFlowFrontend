import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopSidebarComponent } from './top-sidebar';
import { provideRouter } from '@angular/router';

describe('TopSidebarComponent', () => {
  let component: TopSidebarComponent;
  let fixture: ComponentFixture<TopSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopSidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
