import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { TokenService } from './token';
import { IUserExtended } from '../interfaces/user';
import { UserService } from './user';

export interface IAuth {
  access: string;
  refresh: string;
  user: IUserExtended;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private userService = inject(UserService);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private hasToken(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  login(email: string, password: string): Observable<IAuth> {
    return this.http.post<IAuth>(`${this.apiUrl}/token/`, { email, password }).pipe(
      tap((res: IAuth) => {
        this.tokenService.setTokens(res.access, res.refresh);
        this.userService.setDefaultUser(res.user);
        this.isAuthenticatedSubject.next(true);
      }),
    );
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, user);
  }

  refreshToken(): Observable<any> {
    const refresh = this.tokenService.getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    return this.http.post(`${this.apiUrl}/token/refresh/`, { refresh });
  }

  logout(): void {
    const refresh = this.tokenService.getRefreshToken();
    if (refresh) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh }).subscribe({
        next: () => this.cleanup(),
        error: () => this.cleanup(),
      });
    } else {
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.tokenService.clearTokens();
    this.userService.clear()
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
}
