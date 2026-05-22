import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildHTTPParams, ISelectStrictPageQuery } from '../interfaces/common';
import { catchError, Observable, of, take } from 'rxjs';
import { DefaultEmptyGlobalSearchResult, IGlobalSearchResponseSerializer } from '../interfaces/global-search';


@Injectable({
  providedIn: 'root',
})
export class GlobalSearchService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getData(data: ISelectStrictPageQuery): Observable<IGlobalSearchResponseSerializer> {
    return this.http.get<IGlobalSearchResponseSerializer>(`${this.apiUrl}/search/`, {
      params: buildHTTPParams(data),
    }).pipe(
      take(1),
      catchError(() => {
        return of(DefaultEmptyGlobalSearchResult);
      }),
    );
  }
}
