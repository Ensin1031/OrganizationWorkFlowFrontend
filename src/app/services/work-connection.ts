import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { IWorkConnection, IWorkConnectionCreateOrUpdate } from '../interfaces/work-connections';
import { buildHTTPFiltersParams } from '../interfaces/common';


@Injectable({
  providedIn: 'root',
})
export class WorkConnectionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getList(data: { workSlug: string }): Observable<IWorkConnection[]> {
    const url = `${this.apiUrl}/work-connections/`;
    return this.http
      .get<IWorkConnection[]>(url, { params: buildHTTPFiltersParams({ work: data.workSlug }) })
      .pipe(catchError(() => []));
  }
  create(data: IWorkConnectionCreateOrUpdate): Observable<IWorkConnection> {
    return this.http.post<IWorkConnection>(`${this.apiUrl}/work-connections/`, data);
  }
  delete(connectionId: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/work-connections/${connectionId}/`);
  }
}
