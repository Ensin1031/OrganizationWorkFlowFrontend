import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DurationMinutesDirective } from './duration-minutes';
import { formatMinutesHuman } from '../utils/minutes-to-duration';

@Component({
  template: `<input appDurationMinutes [formControl]="ctrl" />`,
  standalone: true,
  imports: [ReactiveFormsModule, DurationMinutesDirective],
})
class HostComponent {
  ctrl = new FormControl(120);
}

describe('DurationMinutesDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create and render formatted value', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input).toBeTruthy();
    expect(input.value).toBe(formatMinutesHuman(120));
  });

  it('should clear control on empty blur', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = '';
    input.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(fixture.componentInstance.ctrl.value).toBeNull();
  });

  it('should set numeric value on blur', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = '45';
    input.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(fixture.componentInstance.ctrl.value).toBe(45);
  });
});
