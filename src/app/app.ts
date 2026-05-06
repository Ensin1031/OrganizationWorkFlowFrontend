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
      )
      .addSvgIcon(
        'dashboardIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/dashboard.svg'),
      )
      .addSvgIcon(
        'tasksIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/tasks.svg'),
      )
      .addSvgIcon(
        'projectsIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/projects.svg'),
      )
      .addSvgIcon(
        'addObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/add-object.svg'),
      )
      .addSvgIcon(
        'editObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edit-object.svg'),
      )
      .addSvgIcon(
        'delObjectIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/del-object.svg'),
      )
      .addSvgIcon(
        'settingsIcon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/settings.svg'),
      );
  }
}
