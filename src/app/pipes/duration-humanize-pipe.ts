import { Pipe, PipeTransform } from '@angular/core';
import { durationToMinutes, formatMinutesHuman } from '../utils/minutes-to-duration';

@Pipe({
  name: 'durationHumanize',
})
export class DurationHumanizePipe implements PipeTransform {
  transform(value?: string | null): string {
    return formatMinutesHuman(durationToMinutes(value));
  }
}
