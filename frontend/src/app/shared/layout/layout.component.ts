import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell">

      <!-- ═══════════════ SIDEBAR ═══════════════ -->
      <aside class="sidebar">

        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="brand-name">SocialCare</span>
        </div>

        <!-- User pill -->
        <div class="user-pill">
          <div class="user-avatar">{{ initiales }}</div>
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="role-badge role-{{ role }}">{{ roleLabel }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <p class="nav-section-label">MENU</p>

          <!-- Dashboard — tous les rôles -->
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span>Tableau de bord</span>
          </a>

          <!-- Admin & Agent -->
          <ng-container *ngIf="role === 'admin' || role === 'agent'">
            <a routerLink="/demandes" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
              <span>Toutes les demandes</span>
            </a>

            <a routerLink="/beneficiaires" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span>Bénéficiaires</span>
            </a>

            <a *ngIf="role === 'admin'" routerLink="/agents" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </span>
              <span>Gestion des agents</span>
            </a>
          </ng-container>

          <!-- Citoyen & Bénéficiaire -->
          <ng-container *ngIf="role === 'citoyen' || role === 'beneficiaire'">
            <a routerLink="/mes-demandes" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </span>
              <span>Mes demandes</span>
            </a>

            <a routerLink="/nouvelle-demande" routerLinkActive="active" class="nav-link nav-link-cta">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </span>
              <span>Nouvelle demande</span>
            </a>
          </ng-container>
        </nav>

        <!-- Déconnexion -->
        <div class="sidebar-bottom">
          <button class="logout-btn" (click)="logout()">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- ═══════════════ MAIN ═══════════════ -->
      <main class="main-area">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    .app-shell {
      display: flex;
      height: 100%;
      background: #f0f4f8;
    }

    /* ──────────── SIDEBAR ──────────── */
    .sidebar {
      width: 252px;
      flex-shrink: 0;
      background: #0f1e2e;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Brand */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: #1e3a5f;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.3px;
    }

    /* User pill */
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 14px 12px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.06);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #38bdf8, #1e40af);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }

    .user-info {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .user-name {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.4px;
      padding: 2px 7px;
      border-radius: 99px;
      text-transform: uppercase;
    }

    .role-admin       { background: rgba(99,102,241,0.25); color: #a5b4fc; }
    .role-agent       { background: rgba(56,189,248,0.2);  color: #7dd3fc; }
    .role-citoyen     { background: rgba(52,211,153,0.2);  color: #6ee7b7; }
    .role-beneficiaire{ background: rgba(251,191,36,0.2);  color: #fcd34d; }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.22);
      letter-spacing: 1px;
      padding: 10px 8px 6px;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      border-radius: 8px;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.9);
    }

    .nav-link.active {
      background: rgba(56,189,248,0.14);
      color: #38bdf8;
    }

    .nav-link-cta {
      background: rgba(30,58,95,0.5);
      color: #7dd3fc;
      border: 1px solid rgba(56,189,248,0.18);
      margin-top: 6px;
    }

    .nav-link-cta:hover {
      background: rgba(56,189,248,0.18);
      color: #38bdf8;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      flex-shrink: 0;
    }

    /* Déconnexion */
    .sidebar-bottom {
      padding: 10px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: rgba(255,255,255,0.35);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.12);
      color: #fca5a5;
    }

    /* ──────────── MAIN ──────────── */
    .main-area {
      flex: 1;
      overflow-y: auto;
      min-width: 0;
    }
  `]
})
export class LayoutComponent implements OnInit {
  role     = 'citoyen';
  username = 'Utilisateur';
  initiales = 'U';

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin:        'Administrateur',
      agent:        'Agent social',
      citoyen:      'Citoyen',
      beneficiaire: 'Bénéficiaire'
    };
    return labels[this.role] || this.role;
  }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.role     = this.auth.getUserRole();
    this.username = this.auth.getUsername();
    const parts   = this.username.trim().split(' ');
    this.initiales = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : this.username.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}