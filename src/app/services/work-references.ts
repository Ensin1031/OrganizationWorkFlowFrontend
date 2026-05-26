import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  IReferenceCreateOrUpdate,
  IReferenceMixin,
  IStatus,
  IWorkDifficulty,
  IWorkPriority,
  IWorkTag,
  IWorkTechnology,
  IWorkType,
} from '../interfaces/references';
import { buildHTTPFiltersParams, buildHTTPParams, defaultEmptyPage, FiltersType, ISelectPageQuery, PaginatedResponse } from '../interfaces/common';
import { IStatusChoices } from '../components/common/status-view/status-view';


@Injectable()
export abstract class BaseReferenceService<T extends IReferenceMixin> {
  protected http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;
  protected abstract endpoint: string;

  protected buildUrl(id?: number): string {
    if (id) {
      return `${this.apiUrl}/${this.endpoint}/${id}/`;
    }
    return `${this.apiUrl}/${this.endpoint}/`;
  }
  private objectsListSignal = signal<IReferenceMixin[]>([]);
  readonly objectsList = this.objectsListSignal.asReadonly();
  getList(data: ISelectPageQuery = {}): Observable<PaginatedResponse<T>> {
    return this.http
      .get<PaginatedResponse<T>>(this.buildUrl(), { params: buildHTTPParams(data) })
      .pipe(
        catchError(() => of(defaultEmptyPage)),
        tap((paginatedResults) => {
          paginatedResults.results.forEach((row) => {
            this.objectsListSignal.update((objects) => {
              const existingObj = objects.find((p) => p.id === row.id);
              if (existingObj) {
                const updatedObj = { ...existingObj, ...row };
                return [...objects.filter((p) => p.id !== row.id), updatedObj];
              }
              return [...objects, row];
            });
          });
        }),
      );
  }
  getById(id: number): Observable<T> {
    return this.http.get<T>(this.buildUrl(id));
  }
  create(data: IReferenceCreateOrUpdate): Observable<T> {
    return this.http.post<T>(this.buildUrl(), data);
  }
  update(id: number, data: IReferenceCreateOrUpdate): Observable<T> {
    return this.http.patch<T>(this.buildUrl(id), data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.buildUrl(id));
  }
  getCanCreate(): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${this.buildUrl()}can-create/`).pipe(
      map((r) => r.can_create),
      catchError(() => of(false)),
    );
  }
  getCanEdit(id: number): Observable<boolean> {
    return this.http.get<{ can_edit: boolean }>(`${this.buildUrl(id)}can-edit/`).pipe(
      map((r) => r.can_edit),
      catchError(() => of(false)),
    );
  }
  getCanView(id: number): Observable<boolean> {
    return this.http.get<{ can_view: boolean }>(`${this.buildUrl(id)}can-view/`).pipe(
      map((r) => r.can_view),
      catchError(() => of(false)),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class StatusesService extends BaseReferenceService<IStatus> {
  protected override endpoint = 'statuses';

  getByFilters(filters: FiltersType): Observable<IStatus[]> {
    return this.http.get<IStatus[]>(`${this.apiUrl}/${this.endpoint}/by-rows/`, {
      params: buildHTTPFiltersParams(filters),
    });
  };

  private readonly statusesChoicesSignal = signal<IStatusChoices[] | null>(null);

  readonly statusesChoices = computed(() => {
    let statusesChoices: IStatusChoices[] = this.statusesChoicesSignal() ?? [];
    if (statusesChoices && statusesChoices.length > 0) return statusesChoices;
    this.getStatusesChoices()
      .pipe(tap((statuses) => (statusesChoices = statuses)))
      .subscribe();
    return statusesChoices;
  });

  override getList(data: ISelectPageQuery = {}): Observable<PaginatedResponse<IStatus>> {
    return super.getList(data).pipe(
      tap((response) => {
        this.syncChoices(response.results);
      }),
    );
  }

  override create(data: IReferenceCreateOrUpdate): Observable<IStatus> {
    return super.create(data).pipe(
      tap((status) => {
        this.upsertChoice(status);
      }),
    );
  }

  override update(id: number, data: IReferenceCreateOrUpdate): Observable<IStatus> {
    return super.update(id, data).pipe(
      tap((status) => {
        this.upsertChoice(status);
      }),
    );
  }

  override delete(id: number): Observable<void> {
    return super.delete(id).pipe(
      tap(() => {
        this.statusesChoicesSignal.update((choices) => {
          if (!choices) {
            return choices;
          }

          return choices.filter((x) => x.value !== id);
        });
      }),
    );
  }

  getStatusesChoices(): Observable<IStatusChoices[]> {
    const cached = this.statusesChoicesSignal();
    if (cached) {
      return of(cached);
    }
    return this.loadAllStatusesRecursive().pipe(
      map((statuses) => {
        const choices = statuses.map((status) => this.mapToChoice(status));
        this.statusesChoicesSignal.set(choices);
        return choices;
      }),
    );
  }

  private loadAllStatusesRecursive(page = 1, acc: IStatus[] = []): Observable<IStatus[]> {
    return super.getList({ page, pageSize: 500 }).pipe(
      switchMap((response) => {
        const nextAcc = [...acc, ...response.results];
        if (!response.next) {
          return of(nextAcc);
        }
        return this.loadAllStatusesRecursive(page + 1, nextAcc);
      }),
    );
  }

  private syncChoices(statuses: IStatus[]): void {
    const cached = this.statusesChoicesSignal();
    if (!cached) {
      return;
    }
    const map = new Map<any, IStatusChoices>();
    cached.forEach((choice) => {
      map.set(choice.value, choice);
    });
    statuses.forEach((status) => {
      map.set(status.id, this.mapToChoice(status));
    });
    this.statusesChoicesSignal.set(Array.from(map.values()));
  }

  private upsertChoice(status: IStatus): void {
    this.statusesChoicesSignal.update((choices) => {
      if (!choices) {
        return choices;
      }
      const filtered = choices.filter((x) => x.value !== status.id);
      return [this.mapToChoice(status), ...filtered];
    });
  }
  private mapToChoice(status: IStatus): IStatusChoices {
    return {
      background: status.color,
      color: '#FFFFFF',
      label: status.name,
      value: status.id,
    };
  }
}

@Injectable({ providedIn: 'root', })
export class WorkTypesService extends BaseReferenceService<IWorkType> {
  protected override endpoint = 'work-types';
}

@Injectable({ providedIn: 'root', })
export class WorkPrioritiesService extends BaseReferenceService<IWorkPriority> {
  protected override endpoint = 'priorities';
}

@Injectable({ providedIn: 'root', })
export class WorkTagsService extends BaseReferenceService<IWorkTag> {
  protected override endpoint = 'tags';
}

@Injectable({ providedIn: 'root', })
export class WorkDifficultiesService extends BaseReferenceService<IWorkDifficulty> {
  protected override endpoint = 'difficulties';
}

@Injectable({ providedIn: 'root', })
export class WorkTechnologiesService extends BaseReferenceService<IWorkTechnology> {
  protected override endpoint = 'technologies';
}
