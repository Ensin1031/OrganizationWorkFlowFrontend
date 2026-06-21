import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusViewComponent, IStatusChoices } from './status-view';

describe('StatusViewComponent', () => {
  let component: StatusViewComponent;
  let fixture: ComponentFixture<StatusViewComponent>;

  const mockChoices: IStatusChoices[] = [
    {
      value: 1,
      label: 'Active',
      color: '#000',
      background: '#0f0',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusViewComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('statusChoices', mockChoices);
    fixture.componentRef.setInput('statusValue', 1);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
