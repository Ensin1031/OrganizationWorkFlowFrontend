import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_PAGINATOR_OPTIONS, MatPaginatorIntlRu } from './tokens/mat-paginator-ru-locale';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MatDatepickerIntlRu } from './tokens/mat-datepicker-ru-locale';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideNativeDateAdapter(),
    provideMomentDateAdapter({
      parse: {
        dateInput: 'DD.MM.YYYY', // Формат, ожидаемый от пользователя
      },
      display: {
        dateInput: 'DD.MM.YYYY', // Как отображать выбранную дату в поле
        monthYearLabel: 'MMMM YYYY', // Как отображать месяц и год в календаре
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      },
    }),
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: LOCALE_ID, useValue: 'ru-RU' },
    {
      provide: DateAdapter,
      useFactory: () => {
        const adapter = new NativeDateAdapter('ru-RU');
        adapter.setLocale('ru-RU');
        return adapter;
      },
    },
    { provide: MatDatepickerIntl, useClass: MatDatepickerIntlRu },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlRu },
    { provide: MAT_PAGINATOR_DEFAULT_OPTIONS, useValue: MAT_PAGINATOR_OPTIONS },
  ],
};
