import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, of } from 'rxjs';
import { IReferenceQueryParams, IStatus, IStatusCreateOrUpdate } from '../interfaces/references';


@Injectable({
  providedIn: 'root',
})
export class WorkReferencesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  // Статусы
  getStatuses(data: IReferenceQueryParams): Observable<IStatus[]> {
    const url = `${this.apiUrl}/statuses/`;
    let params = new HttpParams(); // .set('page', data.page).set('page_size', data.pageSize);
    if (data.search) params = params.set('search', data.search);
    if (data.ordering) params = params.set('ordering', data.ordering);
    return this.http.get<IStatus[]>(url, { params }).pipe(
      catchError(() => of([])),
    );
  }
  createStatus(data: IStatusCreateOrUpdate): Observable<IStatus> {
    return this.http.post<IStatus>(`${this.apiUrl}/statuses/`, data);
  }
  updateStatus(statusId: number, data: IStatusCreateOrUpdate): Observable<IStatus> {
    return this.http.patch<IStatus>(`${this.apiUrl}/statuses/${statusId}/`, data);
  }
  deleteStatus(statusId: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/statuses/${statusId}/`);
  }
}
