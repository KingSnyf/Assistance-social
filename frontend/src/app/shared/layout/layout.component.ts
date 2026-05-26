import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-logo"></div>
          <span class="brand-name">SocialCare</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-label">Navigation</div>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="icon">📊</span> Tableau de bord
            </a>
            
            <!-- ADMIN & AGENT -->
            <ng-container *ngIf="role === 'admin' || role === 'agent'">
              <a routerLink="/demandes" routerLinkActive="active" class="nav-item">
                <span class="icon">📋</span> Toutes les demandes
              </a>
              <a routerLink="/beneficiaires" routerLinkActive="active" class="nav-item">
                <span class="icon">👥</span> Bénéficiaires
              </a>
              <a *ngIf="role === 'admin'" routerLink="/agents" routerLinkActive="active" class="nav-item">
                <span class="icon">👔</span> Gestion Agents
              </a>
            </ng-container>
            
            <!-- CITOYEN & BENEFICIAIRE -->
            <ng-container *ngIf="role === 'citoyen' || role === 'beneficiaire'">
              <a routerLink="/mes-demandes" routerLinkActive="active" class="nav-item">
                <span class="icon">📂</span> Mes demandes
              </a>
            </ng-container>
          </div>
        </nav>
        <div class="sidebar-footer">
          <button (click)="logout()" class="nav-item logout">
            <span class="icon">🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; background: #F5F7FA; }
    .app-container { display: flex; height: 100%; }
    .sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E1E8ED; display: flex; flex-direction: column; }
    .sidebar-header { height: 64px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #F0F4F8; }
    .brand-logo { width: 32px; height: 32px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 10px; }
    .brand-name { font-weight: 700; font-size: 18px; color: #0F172A; }
    .sidebar-nav { flex: 1; padding: 20px 16px; overflow-y: auto; }
    .nav-section { margin-bottom: 20px; }
    .nav-label { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 0.8px; margin-bottom: 12px; padding-left: 8px; text-transform: uppercase; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #475569; text-decoration: none; margin-bottom: 4px; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s; border: none; background: transparent; }
    .nav-item:hover { background: #F1F5F9; color: #0F172A; }
    .nav-item.active { background: #EFF6FF; color: #2563EB; font-weight: 600; }
    .nav-item.logout { color: #EF4444; }
    .nav-item.logout:hover { background: #FEF2F2; }
    .icon { font-size: 18px; width: 20px; text-align: center; }
    .sidebar-footer { padding: 16px; border-top: 1px solid #F0F4F8; }
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  `]
})
export class LayoutComponent {
  role = 'citoyen';

  constructor(private auth: AuthService, private router: Router) {
    this.role = this.auth.getUserRole();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
