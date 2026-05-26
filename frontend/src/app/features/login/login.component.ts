import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="left-content">
          <div class="brand-mark">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="white" fill-opacity="0.15"/>
              <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 5a3 3 0 110 6 3 3 0 010-6zm0 15.5c-3.5 0-6.61-1.79-8.45-4.5.04-2.8 5.63-4.33 8.45-4.33 2.81 0 8.41 1.53 8.45 4.33A9.94 9.94 0 0120 28.5z" fill="white"/>
            </svg>
            <span>SocialCare</span>
          </div>
          <div class="hero-text">
            <h1>Gérer l'aide sociale,<br><em>simplement.</em></h1>
            <p>Plateforme unifiée pour le suivi des bénéficiaires, la gestion des demandes d'aide et le pilotage des interventions sociales.</p>
          </div>
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Suivi en temps réel des dossiers</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Accès multi-rôles sécurisé</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Gestion des interventions</span>
            </div>
          </div>
        </div>
        <div class="left-footer">Institut Universitaire Saint Jean · 2025–2026</div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <div class="card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace personnel</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <div class="form-group" [class.has-error]="isInvalid('username')">
              <label for="username">Identifiant</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="username" formControlName="username" type="text"
                       placeholder="Votre identifiant"
                       autocomplete="username">
              </div>
              <span class="field-error" *ngIf="isInvalid('username')">
                {{ loginForm.get('username')?.errors?.['required'] ? 'Identifiant requis' : 'Minimum 3 caractères' }}
              </span>
            </div>

            <div class="form-group" [class.has-error]="isInvalid('password')">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" formControlName="password"
                       [type]="showPassword ? 'text' : 'password'"
                       placeholder="••••••••"
                       autocomplete="current-password">
                <button type="button" class="toggle-pw" (click)="showPassword = !showPassword" tabindex="-1">
                  <svg *ngIf="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <span class="field-error" *ngIf="isInvalid('password')">
                {{ loginForm.get('password')?.errors?.['required'] ? 'Mot de passe requis' : 'Minimum 6 caractères' }}
              </span>
            </div>

            <div class="server-error" *ngIf="serverError">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ serverError }}
            </div>

            <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || loading">
              <span class="btn-spinner" *ngIf="loading"></span>
              <span *ngIf="!loading">Se connecter</span>
              <span *ngIf="loading">Connexion en cours…</span>
            </button>
          </form>

          <div class="demo-credentials">
            <span class="demo-label">Compte démo</span>
            <code>admin / admin123</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  serverError = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const f = this.loginForm.get(field);
    return !!(f?.invalid && f?.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.serverError = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.serverError = err.error?.detail || 'Identifiants incorrects. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}