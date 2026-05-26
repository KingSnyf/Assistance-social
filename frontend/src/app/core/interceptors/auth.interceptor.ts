import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const refreshInProgress$ = new BehaviorSubject<string | null>(null);
let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  const setHeaders = (request: any, accessToken: string | null) => {
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (!request.headers.has('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    return request.clone({ setHeaders: headers });
  };

  const requestWithAuth = setHeaders(req, token);

  return next(requestWithAuth).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      const isAuthCall = req.url.includes('/auth/login/') || req.url.includes('/auth/refresh/');
      if (isAuthCall) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshInProgress$.next(null);

        authService.refreshToken().subscribe({
          next: (result) => {
            isRefreshing = false;
            refreshInProgress$.next(result.access || null);
          },
          error: () => {
            isRefreshing = false;
            refreshInProgress$.next(null);
          }
        });
      }

      return refreshInProgress$.pipe(
        filter((newToken): newToken is string => !!newToken),
        take(1),
        switchMap((newToken) => {
          const retryReq = setHeaders(req, newToken);
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};