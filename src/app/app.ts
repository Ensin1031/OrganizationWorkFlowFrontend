import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  protected readonly title = signal('organization-workflow-frontend');
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  ngOnInit(): void {
    this.matIconRegistry
      .addSvgIcon(
        'mainSmallLogo',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/small-logo.svg'),
      )
      .addSvgIcon(
        'mainSmallLightLogo',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/small-logo-light.svg'),
      );
  }
}
