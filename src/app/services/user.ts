import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import {
  IUserExtended,
  IUserExtendedCreateOrUpdate,
  IUserExtendedQueryParams,
} from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly USER_STORAGE_KEY: string = 'auth_user';
  private userSubject = new BehaviorSubject<IUserExtended | null>(this.loadFromStorage());

  user$: Observable<IUserExtended | null> = this.userSubject.asObservable();

  private userSignal = signal<IUserExtended | null>(this.userSubject.value);
  user = computed(() => this.userSignal());

  constructor() {
    this.userSubject.subscribe((user) => {
      this.userSignal.set(user);
    });
  }

  setDefaultUser(user: IUserExtended | null): void {
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
    this.userSubject.next(user);
  }
  getDefaultUser(): IUserExtended | null {
    return this.userSubject.value;
  }
  private loadFromStorage(): IUserExtended | null {
    const raw = localStorage.getItem(this.USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  clear(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.userSubject.next(null);
  }

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getUsers(data: IUserExtendedQueryParams): Observable<IUserExtended[]> {
    const url = `${this.apiUrl}/users/`;
    let params = new HttpParams();
    if (data.search) params = params.set('search', data.search);
    if (data.ordering) params = params.set('ordering', data.ordering);
    return this.http.get<IUserExtended[]>(url, { params }).pipe(catchError(() => of([])));
  }
  getUser(userId: number): Observable<IUserExtended[]> {
    const url = `${this.apiUrl}/users/${userId}`;
    let params = new HttpParams();
    return this.http.get<IUserExtended[]>(url, { params });
  }
  createUser(data: IUserExtendedCreateOrUpdate): Observable<IUserExtended> {
    return this.http.post<IUserExtended>(`${this.apiUrl}/users/`, data);
  }
  updateUser(
    userId: number,
    data: IUserExtendedCreateOrUpdate | FormData,
  ): Observable<IUserExtended> {
    return this.http.patch<IUserExtended>(`${this.apiUrl}/users/${userId}/`, data).pipe(
      tap(updateUserData => {
        this.setDefaultUser(updateUserData);
      })
    );
  }
  deleteUser(userId: number): Observable<never> {
    return this.http.delete<never>(`${this.apiUrl}/users/${userId}/`);
  }
  getCanCreate(): Observable<boolean> {
    return this.http.get<{ can_create: boolean }>(`${this.apiUrl}/users/can-create/`).pipe(
      catchError(() => {
        return of({ can_create: false });
      }),
      map((result) => result.can_create),
    );
  }
  getCanEdit(userId: number): Observable<boolean> {
    return this.http.get<{ can_edit: boolean }>(`${this.apiUrl}/users/${userId}/can-edit/`).pipe(
      catchError(() => {
        return of({ can_edit: false });
      }),
      map((result) => result.can_edit),
    );
  }
  getCanView(userId: number): Observable<boolean> {
    return this.http.get<{ can_view: boolean }>(`${this.apiUrl}/users/${userId}/can-view/`).pipe(
      catchError(() => {
        return of({ can_view: false });
      }),
      map((result) => result.can_view),
    );
  }
}
