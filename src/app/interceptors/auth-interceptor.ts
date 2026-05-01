import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = addToken(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/token/')
      ) {
        return handle401Error(authReq, next, authService, tokenService);
      }
      return throwError(() => error);
    }),
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenService: TokenService,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: { access: string }) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.access);
        tokenService.setTokens(response.access, tokenService.getRefreshToken()!);
        return next(addToken(request, response.access));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((access) => next(addToken(request, access))),
    );
  }
}
