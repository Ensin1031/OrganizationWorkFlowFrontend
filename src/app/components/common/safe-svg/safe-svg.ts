import { Component, inject, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-safe-svg',
  imports: [],
  template: `<div class="safe-svg-icon-view" [innerHTML]="safeSvg"></div>`,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
      ::ng-deep .safe-svg-icon-view {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        & svg {
          width: 100%;
          height: 100%;
        }
      }
    `,
  ],
})
export class SafeSvgComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  safeSvg: SafeHtml = '';
  @Input({ required: true }) svgString: string = '';
  ngOnInit() {
    try {
      this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(this.svgString);
    } catch {
      this.safeSvg = '';
    }
  }
}
