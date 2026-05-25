import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-card">
          <div class="brand-header">
            <div class="logo-circle">🌍</div>
            <h1 class="brand-name">SocialCare</h1>
            <p class="brand-tagline">Plateforme d'Assistance Sociale Internationale</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label class="form-label">Rôle</label>
              <select formControlName="role" class="form-select">
                <option value="agent">👔 Agent Social</option>
                <option value="citoyen">🧑 Citoyen</option>
                <option value="beneficiaire">🤝 Bénéficiaire</option>
                <option value="admin">️ Administrateur</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="username">Identifiant</label>
              <input id="username" formControlName="username" type="text" class="form-input" placeholder="Votre username" [class.is-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              <div class="error-message" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">Identifiant requis</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Mot de passe</label>
              <input id="password" formControlName="password" type="password" class="form-input" placeholder="••••••••" [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">Mot de passe requis</div>
            </div>

            <div class="alert alert-error" *ngIf="error">⚠️ {{ error }}</div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || loading" [class.btn-loading]="loading">
              <span *ngIf="loading" class="spinner"></span>
              <span *ngIf="!loading">Se connecter →</span>
            </button>
          </form>

          <div class="footer-note">© 2026 SocialCare — Institut Universitaire Saint Jean</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .login-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%);
      padding: 20px;
    }
    .login-container { width: 100%; max-width: 420px; }
    .login-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 16px; padding: 32px 28px;
      box-shadow: 0 12px 32px rgba(14, 165, 233, 0.15), 0 2px 6px rgba(0,0,0,0.05);
      border: 1px solid rgba(255, 255, 255, 0.6);
    }
    .brand-header { text-align: center; margin-bottom: 24px; }
    .logo-circle {
      width: 52px; height: 52px; background: linear-gradient(135deg, #0EA5E9, #0284C7);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 26px; margin: 0 auto 12px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }
    .brand-name { font-size: 22px; font-weight: 700; color: #0F172A; margin: 0 0 4px; }
    .brand-tagline { font-size: 13px; color: #475569; margin: 0; }
    .login-form { margin-top: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #334155; }
    .form-input, .form-select {
      width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 8px;
      font-size: 14px; color: #0F172A; background: #F8FAFC; transition: all 0.2s;
    }
    .form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748B' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
    .form-input:focus, .form-select:focus { outline: none; border-color: #0EA5E9; background: #FFF; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
    .form-input.is-invalid { border-color: #EF4444; background: #FEF2F2; }
    .error-message { color: #EF4444; font-size: 12px; margin-top: 5px; }
    .alert { padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #0EA5E9, #0284C7); color: #FFF; box-shadow: 0 4px 10px rgba(2,132,199,0.25); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(2,132,199,0.35); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-block { width: 100%; margin-top: 4px; }
    .btn-loading { position: relative; color: transparent; }
    .spinner { position: absolute; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #FFF; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .footer-note { text-align: center; margin-top: 18px; padding-top: 14px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B; }
    @media (max-width: 480px) { .login-card { padding: 24px 16px; } }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['agent', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    
    // Envoie le rôle au backend pour vérification/stockage session
    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Identifiants ou rôle incorrects.';
        this.loading = false;
      }
    });
  }
}