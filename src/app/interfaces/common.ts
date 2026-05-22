import { HttpParams } from '@angular/common/http';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type FiltersType =
  | Record<string, string | number | boolean | string[] | number[] | null | undefined>
  | null
  | undefined;

export interface ISelectPageQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  filters?: FiltersType;
}

export interface ISelectStrictPageQuery {
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  filters?: FiltersType;
}

export const defaultEmptyPage = { count: 0, next: null, previous: null, results: [] };

export function buildHTTPFiltersParams(filters?: FiltersType): HttpParams {
  let params = new HttpParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null
      ) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => {
          params = params.append(key, String(v));
        });
      } else {
        params = params.set(key, String(value));
      }
    });
  }
  return params;
}
export function buildHTTPParams(data: ISelectPageQuery): HttpParams {
  let params = new HttpParams();
  if (data.page) params = params.set('page', data.page);
  if (data.pageSize) params = params.set('page_size', data.pageSize);
  if (data.ordering) params = params.set('ordering', data.ordering);
  let searchParams = '';
  if (data.filters) {
    Object.entries(data.filters).forEach(([key, value]) => {
      if (
        ['page', 'pageSize', 'ordering'].includes(key) ||
        value === undefined ||
        value === null
      ) {
        return;
      }
      if (key === 'search') {
        searchParams = String(value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => {
          params = params.append(key, String(v));
        });
      } else {
        params = params.set(key, String(value));
      }
    });
  }
  if (data.search) {
    params = params.set('search', data.search);
  } else if (searchParams) {
    params = params.set('search', searchParams);
  }
  return params;
}
