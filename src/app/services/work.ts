import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { IWork, IWorkCreateOrUpdate, IWorkPatch } from '../interfaces/works';
import { buildHTTPParams, defaultEmptyPage, ISelectStrictPageQuery, PaginatedResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class WorkService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getWorkPage(data: ISelectStrictPageQuery): Observable<PaginatedResponse<IWork>> {
    const url = `${this.apiUrl}/works/`;
    return this.http
      .get<PaginatedResponse<IWork>>(url, { params: buildHTTPParams(data) })
      .pipe(catchError(() => of(defaultEmptyPage)));
  }
  getWork(workSlug: string): Observable<IWork> {
    const url = `${this.apiUrl}/works/${workSlug}/`;
    let params = new HttpParams();
    return this.http.get<IWork>(url, { params });
  }
  createWork(data: IWorkCreateOrUpdate): Observable<IWork> {
    return this.http.post<IWork>(`${this.apiUrl}/works/`, data);
  }
  updateWork(workSlug: string, data: IWorkCreateOrUpdate): Observable<IWork> {
    return this.http.patch<IWork>(`${this.apiUrl}/works/${workSlug}/`, data);
  }
  patchWork(workSlug: string, data: IWorkPatch): Observable<IWork> {
    return this.http.patch<IWork>(`${this.apiUrl}/works/${workSlug}/`, data);
  }
  deleteWork(workSlug: string): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/works/${workSlug}/`);
  }
  getCanCreateTask(): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${this.apiUrl}/works/can-create/`).pipe(
      catchError(() => {
        return of({ can_create: false });
      }),
      map((result) => result.can_create),
    );
  }
  getCanEdit(workSlug: string): Observable<boolean> {
    return this.http.get<{ can_edit: boolean }>(`${this.apiUrl}/works/${workSlug}/can-edit/`).pipe(
      catchError(() => {
        return of({ can_edit: false });
      }),
      map((result) => result.can_edit),
    );
  }
  getCanView(workSlug: string): Observable<boolean> {
    return this.http.get<{ can_view: boolean }>(`${this.apiUrl}/works/${workSlug}/can-view/`).pipe(
      catchError(() => {
        return of({ can_view: false });
      }),
      map((result) => result.can_view),
    );
  }
}
