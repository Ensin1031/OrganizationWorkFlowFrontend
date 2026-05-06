import { Injectable } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

@Injectable()
export class MatDatepickerIntlRu extends MatDatepickerIntl {
  override calendarLabel = 'Календарь';
  override openCalendarLabel = 'Открыть календарь';
  override prevMonthLabel = 'Предыдущий месяц';
  override nextMonthLabel = 'Следующий месяц';
  override prevYearLabel = 'Предыдущий год';
  override nextYearLabel = 'Следующий год';
}
