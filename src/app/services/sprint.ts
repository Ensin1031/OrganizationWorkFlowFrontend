import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { ISprint, ISprintCreateOrUpdate, ISprintLoad } from '../interfaces/sprints';
import {
  buildHTTPFiltersParams,
  buildHTTPParams,
  defaultEmptyPage,
  FiltersType,
  ISelectStrictPageQuery,
  PaginatedResponse,
} from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class SprintService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getSprintPage(data: ISelectStrictPageQuery): Observable<PaginatedResponse<ISprint>> {
    const url = `${this.apiUrl}/sprints/`;
    return this.http
      .get<PaginatedResponse<ISprint>>(url, { params: buildHTTPParams(data) })
      .pipe(catchError(() => of(defaultEmptyPage)));
  }
  getSprint(sprintSlug: string): Observable<ISprint> {
    const url = `${this.apiUrl}/sprints/${sprintSlug}/`;
    let params = new HttpParams();
    return this.http.get<ISprint>(url, { params });
  }
  createSprint(data: ISprintCreateOrUpdate): Observable<ISprint> {
    return this.http.post<ISprint>(`${this.apiUrl}/sprints/`, data);
  }
  updateSprint(sprintSlug: string, data: ISprintCreateOrUpdate): Observable<ISprint> {
    return this.http.patch<ISprint>(`${this.apiUrl}/sprints/${sprintSlug}/`, data);
  }
  deleteSprint(sprintSlug: string): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/sprints/${sprintSlug}/`);
  }
  getCanCreate(): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${this.apiUrl}/sprints/can-create/`).pipe(
      catchError(() => {
        return of({ can_create: false });
      }),
      map((result) => result.can_create),
    );
  }
  getCanEdit(sprintSlug: string): Observable<boolean> {
    return this.http
      .get<{ can_edit: boolean }>(`${this.apiUrl}/sprints/${sprintSlug}/can-edit/`)
      .pipe(
        catchError(() => {
          return of({ can_edit: false });
        }),
        map((result) => result.can_edit),
      );
  }
  getCanView(sprintSlug: string): Observable<boolean> {
    return this.http
      .get<{ can_view: boolean }>(`${this.apiUrl}/sprints/${sprintSlug}/can-view/`)
      .pipe(
        catchError(() => {
          return of({ can_view: false });
        }),
        map((result) => result.can_view),
      );
  }

  getSprintUsersLoad(sprintSlug: string, filters: FiltersType): Observable<ISprintLoad> {
    return this.http
      .get<ISprintLoad>(`${this.apiUrl}/sprints/${sprintSlug}/users-load`, {
        params: buildHTTPFiltersParams(filters),
      })
      .pipe(
        catchError(() => {
          return of({
            users: [],
            without_users: null,
          });
        }),
        map(result => {
          if (!result.users || !Array.isArray(result.users)) {
            result.users = []
          }
          return result
        })
      );
  }
}
