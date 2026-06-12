import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw  = control.get('password');
  const pw2 = control.get('password2');
  if (pw && pw2 && pw.value !== pw2.value) {
    pw2.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  if (pw2?.errors?.['mismatch']) {
    const { mismatch, ...rest } = pw2.errors!;
    pw2.setErrors(Object.keys(rest).length ? rest : null);
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
            <h1>Rejoignez<br><em>SocialCare.</em></h1>
            <p>Créez votre compte citoyen pour soumettre des demandes d'aide sociale et suivre leur traitement en temps réel.</p>
          </div>
          <div class="features-list">
            <div class="feature-item"><div class="feature-dot"></div><span>Soumission de demandes en ligne</span></div>
            <div class="feature-item"><div class="feature-dot"></div><span>Suivi de vos dossiers</span></div>
            <div class="feature-item"><div class="feature-dot"></div><span>Notifications en temps réel</span></div>
          </div>
        </div>
        <div class="left-footer">Institut Universitaire Saint Jean · 2025–2026</div>
      </div>

      <div class="login-right">
        <div class="login-card" style="max-width:460px">
          <div class="card-header">
            <h2>Créer un compte</h2>
            <p>Remplissez les informations ci-dessous</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group" [class.has-error]="isInvalid('first_name')">
                <label for="first_name">Prénom</label>
                <div class="input-wrapper">
                  <input id="first_name" formControlName="first_name" type="text" placeholder="Prénom">
                </div>
                <span class="field-error" *ngIf="isInvalid('first_name')">Prénom requis</span>
              </div>
              <div class="form-group" [class.has-error]="isInvalid('last_name')">
                <label for="last_name">Nom</label>
                <div class="input-wrapper">
                  <input id="last_name" formControlName="last_name" type="text" placeholder="Nom">
                </div>
                <span class="field-error" *ngIf="isInvalid('last_name')">Nom requis</span>
              </div>
            </div>

            <div class="form-group" [class.has-error]="isInvalid('username')">
              <label for="username">Identifiant</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="username" formControlName="username" type="text" placeholder="Votre identifiant" autocomplete="username">
              </div>
              <span class="field-error" *ngIf="isInvalid('username')">
                {{ registerForm.get('username')?.errors?.['required'] ? 'Identifiant requis' : 'Minimum 3 caractères' }}
              </span>
            </div>

            <div class="form-group" [class.has-error]="isInvalid('email')">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input id="email" formControlName="email" type="email" placeholder="votre@email.com" autocomplete="email">
              </div>
              <span class="field-error" *ngIf="isInvalid('email')">Email invalide</span>
            </div>

            <div class="form-group" [class.has-error]="isInvalid('password')">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" formControlName="password"
                       [type]="showPassword ? 'text' : 'password'"
                       placeholder="••••••••" autocomplete="new-password">
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
                {{ registerForm.get('password')?.errors?.['required'] ? 'Mot de passe requis' : 'Minimum 6 caractères' }}
              </span>
            </div>

            <div class="form-group" [class.has-error]="isInvalid('password2')">
              <label for="password2">Confirmer le mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password2" formControlName="password2"
                       [type]="showPassword ? 'text' : 'password'"
                       placeholder="••••••••" autocomplete="new-password">
              </div>
              <span class="field-error" *ngIf="isInvalid('password2')">
                {{ registerForm.get('password2')?.errors?.['required'] ? 'Confirmation requise' : 'Les mots de passe ne correspondent pas' }}
              </span>
            </div>

            <div class="server-error" *ngIf="serverError">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ serverError }}
            </div>

            <div *ngIf="successMessage" style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 14px;color:#166534;font-size:13.5px;display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ successMessage }}
            </div>

            <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || loading">
              <span class="btn-spinner" *ngIf="loading"></span>
              <span *ngIf="!loading">Créer mon compte</span>
              <span *ngIf="loading">Création en cours…</span>
            </button>
          </form>

          <div style="text-align:center;margin-top:20px;font-size:14px;color:#6b7280">
            Déjà un compte ?
            <a routerLink="/login" style="color:#4f46e5;font-weight:500;text-decoration:none;margin-left:4px">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading        = false;
  serverError    = '';
  successMessage = '';
  showPassword   = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      password2:  ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  isInvalid(field: string): boolean {
    const f = this.registerForm.get(field);
    return !!(f?.invalid && f?.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';

    this.auth.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err: HttpErrorResponse) => {
        const errors = err.error;
        if (typeof errors === 'object') {
          this.serverError = (Object.values(errors).flat() as string[]).join(' ') || 'Une erreur est survenue.';
        } else {
          this.serverError = 'Une erreur est survenue. Veuillez réessayer.';
        }
        this.loading = false;
      }
    });
  }
}