import { Component, input } from '@angular/core';

export interface IStatusChoices {
  background: string;
  color: string;
  label: string;
  value: number | string | boolean;
}

@Component({
  selector: 'app-status-view',
  imports: [],
  template: `
    <div
      [style]="{
        background: getStatusBackgroundColor(),
        color: getStatusColor(),
        'border-radius': '6px',
        'padding-left': '.5rem',
        'padding-right': '.5rem',
        'white-space': 'nowrap',
        width: 'fit-content',
      }"
    >
      {{ getStatusName() }}
    </div>
  `,
  styles: [``],
})
export class StatusViewComponent {
  statusChoices = input.required<IStatusChoices[]>();
  statusValue = input.required<number | string | boolean>();

  private get statusData(): IStatusChoices | undefined {
    const inputStatusData = this.statusChoices().filter((row) => row.value === this.statusValue());
    if (inputStatusData.length > 0) {
      return inputStatusData[0];
    }
    return;
  }

  getStatusName(): string {
    const inputStatusData = this.statusData;
    if (inputStatusData) {
      return inputStatusData.label;
    }
    return '';
  }

  getStatusColor(): string {
    const inputStatusData = this.statusData;
    if (inputStatusData) {
      return inputStatusData.color;
    }
    return '#FFF';
  }

  getStatusBackgroundColor(): string {
    const inputStatusData = this.statusData;
    if (inputStatusData) {
      return inputStatusData.background;
    }
    return '#FFF';
  }
}
