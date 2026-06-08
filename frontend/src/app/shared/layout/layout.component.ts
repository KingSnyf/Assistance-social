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

      <!-- ══════════════════ SIDEBAR ══════════════════ -->
      <aside class="sidebar">

        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">SocialCare</span>
            <span class="brand-tagline">Assistance Sociale</span>
          </div>
        </div>

        <!-- User card -->
        <div class="user-card">
          <div class="user-avatar-wrap">
            <div class="user-avatar">{{ initiales }}</div>
            <div class="user-status"></div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="role-badge role-{{ role }}">{{ roleLabel }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <p class="nav-section-label">Navigation</p>

          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1z"/>
              </svg>
            </span>
            <span class="nav-label">Tableau de bord</span>
          </a>

          <ng-container *ngIf="role === 'admin' || role === 'agent'">

            <p class="nav-section-label" style="margin-top:12px">Gestion</p>

            <a routerLink="/demandes" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
              <span class="nav-label">Demandes</span>
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
              <span class="nav-label">Bénéficiaires</span>
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
              <span class="nav-label">Agents</span>
            </a>

          </ng-container>

          <ng-container *ngIf="role === 'citoyen' || role === 'beneficiaire'">

            <p class="nav-section-label" style="margin-top:12px">Mes dossiers</p>

            <a routerLink="/mes-demandes" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                </svg>
              </span>
              <span class="nav-label">Mes demandes</span>
            </a>

            <a routerLink="/nouvelle-demande" routerLinkActive="active" class="nav-link nav-cta">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </span>
              <span class="nav-label">Nouvelle demande</span>
            </a>

          </ng-container>
        </nav>

        <!-- Footer sidebar : déconnexion fixée en bas -->
        <div class="sidebar-footer">
          <div class="sidebar-divider"></div>
          <button class="logout-btn" (click)="logout()">
            <span class="logout-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span>Déconnexion</span>
          </button>
        </div>

      </aside>

      <!-- ══════════════════ MAIN ══════════════════ -->
      <div class="main-wrapper">

        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-breadcrumb">
              <span class="breadcrumb-app">SocialCare</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="breadcrumb-page">{{ pageTitle }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ today }}
            </div>
            <div class="topbar-user">
              <div class="topbar-avatar">{{ initiales }}</div>
              <span class="topbar-username">{{ username }}</span>
            </div>
          </div>
        </header>

        <main class="main-area">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    .app-shell {
      display: flex;
      height: 100%;
    }

    /* ══════════════ SIDEBAR ══════════════ */
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background: #0f2a1f;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: relative;
      /* Subtle right border */
      box-shadow: 1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.18);
    }

    /* ── Brand ── */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 22px 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #16a34a, #15803d);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(22,163,74,0.35);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.4px;
      line-height: 1.1;
    }

    .brand-tagline {
      font-size: 10px;
      font-weight: 500;
      color: rgba(167,243,208,0.6);
      letter-spacing: 0.3px;
    }

    /* ── User card ── */
    .user-card {
      display: flex;
      align-items: center;
      gap: 11px;
      margin: 14px 14px 6px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.055);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
      transition: background 0.2s;
    }

    .user-card:hover {
      background: rgba(255,255,255,0.08);
    }

    .user-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #16a34a, #166534);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: white;
      letter-spacing: 0.5px;
    }

    /* Pastille verte "en ligne" */
    .user-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #4ade80;
      border: 2px solid #0f2a1f;
      border-radius: 50%;
    }

    .user-info {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 700;
      color: #f0fdf4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 99px;
      text-transform: uppercase;
      width: fit-content;
    }

    .role-admin        { background: rgba(22,163,74,0.22);  color: #86efac; }
    .role-agent        { background: rgba(16,185,129,0.18); color: #6ee7b7; }
    .role-citoyen      { background: rgba(74,222,128,0.15); color: #a7f3d0; }
    .role-beneficiaire { background: rgba(251,191,36,0.18); color: #fcd34d; }

    /* ── Nav ── */
    .sidebar-nav {
      flex: 1;
      padding: 10px 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow-y: auto;
      min-height: 0;
    }

    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.2);
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 8px 10px 5px;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 9px 10px;
      border-radius: 9px;
      color: rgba(209,250,229,0.65);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.15s ease;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.07);
      color: #f0fdf4;
    }

    /* Barre verte à gauche sur l'item actif */
    .nav-link.active {
      background: rgba(22,163,74,0.18);
      color: #ffffff;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      background: #4ade80;
      border-radius: 0 3px 3px 0;
    }

    .nav-link.active .nav-icon {
      color: #4ade80;
    }

    /* CTA nouvelle demande */
    .nav-cta {
      background: rgba(22,101,52,0.35);
      color: #86efac;
      border: 1px solid rgba(74,222,128,0.18);
      margin-top: 4px;
    }
    .nav-cta:hover {
      background: rgba(22,163,74,0.25);
      color: #ffffff;
      border-color: rgba(74,222,128,0.3);
    }
    .nav-cta.active {
      background: rgba(22,163,74,0.3);
      color: #ffffff;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      flex-shrink: 0;
      opacity: 0.85;
      transition: opacity 0.15s;
    }

    .nav-link:hover .nav-icon,
    .nav-link.active .nav-icon { opacity: 1; }

    .nav-label { flex: 1; }

    /* ── Footer sidebar (déconnexion fixée en bas) ── */
    .sidebar-footer {
      flex-shrink: 0;
      padding: 0 12px 16px;
    }

    .sidebar-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin-bottom: 10px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid rgba(239,68,68,0.0);
      border-radius: 9px;
      color: rgba(252,165,165,0.45);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: inherit;
      text-align: left;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.2);
      color: #fca5a5;
    }

    .logout-icon {
      display: flex;
      align-items: center;
      opacity: 0.7;
      transition: opacity 0.15s;
    }

    .logout-btn:hover .logout-icon { opacity: 1; }

    /* ══════════════ MAIN WRAPPER ══════════════ */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: #f1f5f9;
    }

    /* ── Topbar ── */
    .topbar {
      height: 56px;
      flex-shrink: 0;
      background: #ffffff;
      border-bottom: 1px solid #e8edf3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .topbar-left { display: flex; align-items: center; }

    .topbar-breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .breadcrumb-app {
      color: #94a3b8;
      font-weight: 600;
    }

    .breadcrumb-page {
      color: #166534;
      font-weight: 700;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topbar-date {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #94a3b8;
      font-weight: 500;
      padding: 6px 12px;
      background: #f8fafc;
      border: 1px solid #e8edf3;
      border-radius: 8px;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px 5px 6px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 99px;
      cursor: default;
    }

    .topbar-avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #16a34a, #166534);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      color: white;
    }

    .topbar-username {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
    }

    /* ── Main scrollable area ── */
    .main-area {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
  `]
})
export class LayoutComponent implements OnInit {
  role      = 'citoyen';
  username  = 'Utilisateur';
  initiales = 'U';
  today     = '';

  get pageTitle(): string {
    const titles: Record<string, string> = {
      admin:        'Administration',
      agent:        'Espace agent',
      citoyen:      'Espace citoyen',
      beneficiaire: 'Espace bénéficiaire',
    };
    return titles[this.role] || 'Tableau de bord';
  }

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin:        'Administrateur',
      agent:        'Agent social',
      citoyen:      'Citoyen',
      beneficiaire: 'Bénéficiaire',
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
    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}