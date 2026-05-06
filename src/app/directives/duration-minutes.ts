import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatMinutesHuman } from '../utils/minutes-to-duration';

@Directive({
  selector: 'input[appDurationMinutes]',
})
export class DurationMinutesDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl);

  @Input() showDashWhenEmpty = true;

  ngOnInit(): void {
    queueMicrotask(() => {
      this.renderFormattedValue();
    });
  }

  @HostListener('focus')
  onFocus(): void {
    const value = this.ngControl.control?.value;
    if (value === null || value === undefined) {
      this.el.nativeElement.value = '';
      return;
    }
    this.el.nativeElement.value = String(value);
  }

  @HostListener('blur')
  onBlur(): void {
    const raw = this.el.nativeElement.value.trim();
    if (!raw) {
      this.ngControl.control?.setValue(null);
      this.renderFormattedValue();
      return;
    }
    const minutes = Number(raw);
    if (isNaN(minutes) || minutes < 0) {
      this.ngControl.control?.setValue(null);
      this.renderFormattedValue();
      return;
    }
    this.ngControl.control?.setValue(minutes);
    this.renderFormattedValue();
  }

  private renderFormattedValue(): void {
    const value = this.ngControl.control?.value;
    this.el.nativeElement.value = formatMinutesHuman(value);
  }

}
