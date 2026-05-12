import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  buildHTTPParams,
  defaultEmptyPage,
  ISelectStrictPageQuery,
  PaginatedResponse,
} from '../interfaces/common';
import { catchError, map, Observable, of } from 'rxjs';
import {
  IWorkComment,
  IWorkCommentCreateOrUpdate,
  IWorkCommentPatch,
} from '../interfaces/comments';


@Injectable({
  providedIn: 'root',
})
export class WorkCommentService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getCommentsPage(
    workSlug: string,
    data: ISelectStrictPageQuery,
  ): Observable<PaginatedResponse<IWorkComment>> {
    const url = `${this.apiUrl}/comments/`;
    if (data.filters) {
      data.filters = { ...data.filters, work: workSlug };
    } else {
      data.filters = { work: workSlug };
    }
    return this.http
      .get<PaginatedResponse<IWorkComment>>(url, { params: buildHTTPParams(data) })
      .pipe(catchError(() => of(defaultEmptyPage)));
  }
  getComment(slug: string): Observable<IWorkComment> {
    const url = `${this.apiUrl}/comments/${slug}/`;
    let params = new HttpParams();
    return this.http.get<IWorkComment>(url, { params });
  }
  create(data: IWorkCommentCreateOrUpdate): Observable<IWorkComment> {
    return this.http.post<IWorkComment>(`${this.apiUrl}/comments/`, data);
  }
  update(slug: string, data: IWorkCommentCreateOrUpdate): Observable<IWorkComment> {
    return this.http.patch<IWorkComment>(`${this.apiUrl}/comments/${slug}/`, data);
  }
  patch(slug: string, data: IWorkCommentPatch): Observable<IWorkComment> {
    return this.http.patch<IWorkComment>(`${this.apiUrl}/comments/${slug}/`, data);
  }
  delete(slug: string): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/comments/${slug}/`);
  }
  getCanCreate(): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${this.apiUrl}/comments/can-create/`).pipe(
      catchError(() => {
        return of({ can_create: false });
      }),
      map((result) => result.can_create),
    );
  }
  getCanEdit(slug: string): Observable<boolean> {
    return this.http.get<{ can_edit: boolean }>(`${this.apiUrl}/comments/${slug}/can-edit/`).pipe(
      catchError(() => {
        return of({ can_edit: false });
      }),
      map((result) => result.can_edit),
    );
  }
  getCanView(slug: string): Observable<boolean> {
    return this.http.get<{ can_view: boolean }>(`${this.apiUrl}/comments/${slug}/can-view/`).pipe(
      catchError(() => {
        return of({ can_view: false });
      }),
      map((result) => result.can_view),
    );
  }
}
