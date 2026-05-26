import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'socialcare_token';
  private refreshTokenKey = 'socialcare_refresh';
  private authState = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isAuthenticated$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(res => this.setSessionTokens(res.access, res.refresh))
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return of({ access: '', refresh: '' });
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh/`, { refresh }).pipe(
      tap(res => this.setSessionTokens(res.access, res.refresh)),
      catchError(() => {
        this.logout();
        return of({ access: '', refresh: '' });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.authState.next(false);
  }

  setSessionTokens(access: string, refresh: string): void {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
    this.authState.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string {
    return this.getTokenClaim('role', 'citoyen');
  }

  getUsername(): string {
    return this.getTokenClaim('username', 'Utilisateur');
  }

  private getTokenClaim<T>(claim: string, fallback: T): T {
    const token = this.getToken();
    if (!token) {
      return fallback;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.[claim] ?? fallback;
    } catch {
      return fallback;
    }
  }
}