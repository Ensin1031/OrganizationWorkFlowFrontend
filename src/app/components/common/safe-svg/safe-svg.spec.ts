import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeSvgComponent } from './safe-svg';

describe('SafeSvgComponent', () => {
  let component: SafeSvgComponent;
  let fixture: ComponentFixture<SafeSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafeSvgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SafeSvgComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
