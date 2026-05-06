import { MatPaginatorDefaultOptions, MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';


@Injectable()
export class MatPaginatorIntlRu extends MatPaginatorIntl {
  override itemsPerPageLabel = 'На странице';
  override firstPageLabel = 'Первая страница';
  override lastPageLabel = 'Последняя страница';
  override nextPageLabel = 'Следующая страница';
  override previousPageLabel = 'Предыдущая страница';
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0) return 'Страница 1 из 1';
    if (length % pageSize == 0)
      return 'Страница ' + (page + 1) + ' из ' + Math.floor(length / pageSize);
    else return 'Страница ' + (page + 1) + ' из ' + (Math.floor(length / pageSize) + 1);
  };
}

export const MAT_PAGINATOR_OPTIONS: MatPaginatorDefaultOptions = {
  /** Number of items to display on a page. By default set to 50. */
  pageSize: 20,

  /** The set of provided page size options to display to the user. */
  pageSizeOptions: [20, 50, 100],

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize: false,

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons: true,
};
