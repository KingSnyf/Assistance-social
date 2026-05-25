import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'socialcare_token';
  private authState = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isAuthenticated$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access);
        localStorage.setItem('socialcare_refresh', res.refresh);
        this.authState.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('socialcare_refresh');
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return 'citoyen';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'citoyen';
    } catch {
      return 'citoyen';
    }
  }

  getUsername(): string {
    const token = this.getToken();
    if (!token) return 'Utilisateur';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'Utilisateur';
    } catch {
      return 'Utilisateur';
    }
  }
}