import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">🌍</div>
          <span class="brand-name">SocialCare</span>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-title">MENU</div>
            
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

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- TOPBAR -->
        <header class="topbar">
          <div>
            <h2 class="page-title">Tableau de bord</h2>
            <p class="page-subtitle">{{ getRoleDescription() }}</p>
          </div>
          
          <div class="topbar-actions">
            <!-- BOUTON NOUVELLE DEMANDE (Citoyens uniquement) -->
            <button *ngIf="role === 'citoyen' || role === 'beneficiaire'" 
                    routerLink="/nouvelle-demande" 
                    class="btn-new">
              ➕ Nouvelle demande
            </button>
            
            <!-- USER INFO -->
            <div class="user-pill">
              <div class="avatar">{{ username | slice:0:2 | uppercase }}</div>
              <div class="user-info">
                <span class="user-name">{{ username }}</span>
                <span class="user-role">{{ getRoleLabel() }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTENT -->
        <div class="content">
          
          <!-- STATS CARDS (Dynamiques) -->
          <div class="stats-grid">
            
            <!-- ADMIN -->
            <ng-container *ngIf="role === 'admin'">
              <div class="card stat">
                <div class="stat-icon blue">👥</div>
                <div class="stat-info">
                  <div class="label">Utilisateurs</div>
                  <div class="value">1,240</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon green">💰</div>
                <div class="stat-info">
                  <div class="label">Budget Total</div>
                  <div class="value">840K$</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon orange">⚙️</div>
                <div class="stat-info">
                  <div class="label">Agents Actifs</div>
                  <div class="value">48</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon red">📈</div>
                <div class="stat-info">
                  <div class="label">Efficacité</div>
                  <div class="value">94%</div>
                </div>
              </div>
            </ng-container>
            
            <!-- AGENT -->
            <ng-container *ngIf="role === 'agent'">
              <div class="card stat">
                <div class="stat-icon blue">📋</div>
                <div class="stat-info">
                  <div class="label">Dossiers Assignés</div>
                  <div class="value">24</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon orange">⏳</div>
                <div class="stat-info">
                  <div class="label">En Attente</div>
                  <div class="value">8</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon green">✅</div>
                <div class="stat-info">
                  <div class="label">Résolus ce mois</div>
                  <div class="value">142</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon red">🎯</div>
                <div class="stat-info">
                  <div class="label">Performance</div>
                  <div class="value">92%</div>
                </div>
              </div>
            </ng-container>
            
            <!-- CITOYEN / BENEFICIAIRE -->
            <ng-container *ngIf="role === 'citoyen' || role === 'beneficiaire'">
              <div class="card stat">
                <div class="stat-icon blue">📂</div>
                <div class="stat-info">
                  <div class="label">Mes Demandes</div>
                  <div class="value">3</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon orange">⏳</div>
                <div class="stat-info">
                  <div class="label">En Cours</div>
                  <div class="value">1</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon green">✅</div>
                <div class="stat-info">
                  <div class="label">Approuvées</div>
                  <div class="value">2</div>
                </div>
              </div>
              <div class="card stat">
                <div class="stat-icon red">💶</div>
                <div class="stat-info">
                  <div class="label">Aide Reçue</div>
                  <div class="value">350$</div>
                </div>
              </div>
            </ng-container>
            
          </div>

          <!-- TABLE SECTION -->
          <div class="card table-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">{{ getTableTitle() }}</h3>
                <p class="card-subtitle">{{ getTableSubtitle() }}</p>
              </div>
              <button class="btn-outline">Voir tout →</button>
            </div>
            
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th *ngIf="role === 'citoyen' || role === 'beneficiaire'">Type</th>
                    <th *ngIf="role !== 'citoyen' && role !== 'beneficiaire'">Bénéficiaire</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="mono">#SC-4821</td>
                    <td *ngIf="role === 'citoyen' || role === 'beneficiaire'">Aide financière</td>
                    <td *ngIf="role !== 'citoyen' && role !== 'beneficiaire'">Marie Koné</td>
                    <td><span class="badge status-warning">En cours</span></td>
                    <td class="text-muted">15 Jan 2025</td>
                    <td class="text-right"><button class="btn-sm">Détail</button></td>
                  </tr>
                  <tr>
                    <td class="mono">#SC-4820</td>
                    <td *ngIf="role === 'citoyen' || role === 'beneficiaire'">Logement</td>
                    <td *ngIf="role !== 'citoyen' && role !== 'beneficiaire'">Ibrahim Diallo</td>
                    <td><span class="badge status-success">Approuvée</span></td>
                    <td class="text-muted">14 Jan 2025</td>
                    <td class="text-right"><button class="btn-sm">Détail</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; background: #F5F7FA; }
    
    .app-container { display: flex; height: 100%; }
    
    /* SIDEBAR */
    .sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E1E8ED; display: flex; flex-direction: column; }
    .sidebar-header { height: 64px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #F0F4F8; }
    .brand-logo { width: 32px; height: 32px; background: #4A90E2; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 10px; }
    .brand-name { font-weight: 700; font-size: 18px; color: #2C3E50; }
    .sidebar-nav { flex: 1; padding: 20px 16px; overflow-y: auto; }
    .nav-section { margin-bottom: 20px; }
    .nav-title { font-size: 11px; font-weight: 700; color: #95A5A6; letter-spacing: 1px; margin-bottom: 12px; padding-left: 8px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #5A6C7D; text-decoration: none; margin-bottom: 4px; font-weight: 500; font-size: 14px; cursor: pointer; }
    .nav-item:hover { background: #F0F7FF; color: #4A90E2; }
    .nav-item.active { background: #E3F2FD; color: #1976D2; font-weight: 600; }
    .nav-item.logout { color: #E74C3C; }
    .nav-item.logout:hover { background: #FEE; }
    .icon { font-size: 18px; width: 20px; text-align: center; }
    .sidebar-footer { padding: 16px; border-top: 1px solid #F0F4F8; }
    
    /* MAIN */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar { height: 64px; background: #FFFFFF; border-bottom: 1px solid #E1E8ED; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; }
    .page-title { font-size: 18px; font-weight: 700; color: #2C3E50; margin: 0; }
    .page-subtitle { font-size: 13px; color: #7F8C8D; margin-top: 2px; }
    
    .topbar-actions { display: flex; align-items: center; gap: 16px; }
    
    .btn-new {
      background: #2563EB; 
      color: white; 
      border: none; 
      padding: 8px 16px; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 13px; 
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-new:hover { 
      background: #1D4ED8; 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37,99,235,0.2);
    }
    
    .user-pill { display: flex; align-items: center; gap: 12px; padding: 6px 16px 6px 6px; background: #F8FAFC; border: 1px solid #E1E8ED; border-radius: 99px; }
    .avatar { width: 32px; height: 32px; background: #4A90E2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 600; color: #2C3E50; }
    .user-role { font-size: 10px; font-weight: 700; color: #4A90E2; text-transform: uppercase; }
    
    /* CONTENT */
    .content { flex: 1; overflow-y: auto; padding: 32px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    
    .card { background: #FFFFFF; border: 1px solid #E1E8ED; border-radius: 12px; padding: 20px; }
    .card.stat { display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-icon.blue { background: #E3F2FD; }
    .stat-icon.green { background: #E8F5E9; }
    .stat-icon.orange { background: #FFF3E0; }
    .stat-icon.red { background: #FFEBEE; }
    .stat-info .label { font-size: 12px; color: #7F8C8D; font-weight: 600; text-transform: uppercase; }
    .stat-info .value { font-size: 24px; font-weight: 700; color: #2C3E50; margin-top: 4px; }
    
    .card.table-card { padding: 0; overflow: hidden; }
    .card-header { padding: 20px 24px; border-bottom: 1px solid #F0F4F8; display: flex; justify-content: space-between; align-items: center; }
    .card-title { font-size: 16px; font-weight: 700; color: #2C3E50; margin: 0; }
    .card-subtitle { font-size: 13px; color: #7F8C8D; margin: 4px 0 0; }
    .btn-outline { padding: 6px 12px; border: 1px solid #D0DCE5; border-radius: 6px; background: white; color: #5A6C7D; font-size: 12px; font-weight: 500; cursor: pointer; }
    .btn-outline:hover { background: #F8FAFC; border-color: #B0C4D3; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 24px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #7F8C8D; font-weight: 600; background: #FAFBFC; border-bottom: 2px solid #E1E8ED; }
    td { padding: 16px 24px; border-bottom: 1px solid #F0F4F8; font-size: 14px; color: #34495E; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F8FAFC; }
    
    .mono { font-family: 'SF Mono', monospace; font-size: 12px; background: #E3F2FD; color: #1976D2; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .text-muted { color: #95A5A6; }
    .text-right { text-align: right; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .status-success { background: #E8F5E9; color: #27AE60; }
    .status-warning { background: #FFF3E0; color: #E67E22; }
    .status-danger { background: #FFEBEE; color: #E74C3C; }
    .btn-sm { padding: 6px 12px; border: 1px solid #D0DCE5; border-radius: 6px; background: white; color: #5A6C7D; font-size: 12px; cursor: pointer; }
    .btn-sm:hover { border-color: #B0C4D3; background: #F8FAFC; }
    
    @media(max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width: 768px) { .sidebar { display: none; } .main-content { margin-left: 0; } .stats-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent {
  role = 'citoyen';
  username = 'Utilisateur';

  constructor(private auth: AuthService, private router: Router) {
    this.role = this.auth.getUserRole();
    const token = this.auth.getToken();
    if(token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.username || 'Utilisateur';
      } catch(e) {}
    }
  }

  getRoleLabel(): string {
    const labels: any = {
      'admin': 'Administrateur',
      'agent': 'Agent Social',
      'citoyen': 'Citoyen',
      'beneficiaire': 'Bénéficiaire'
    };
    return labels[this.role] || this.role;
  }

  getRoleDescription(): string {
    if(this.role === 'admin') return 'Gérez l\'ensemble du système SocialCare';
    if(this.role === 'agent') return 'Traitez les dossiers qui vous sont assignés';
    if(this.role === 'beneficiaire') return 'Suivez vos demandes d\'aide en temps réel';
    return 'Soumettez et suivez vos demandes sociales';
  }

  getTableTitle(): string {
    if(this.role === 'admin') return 'Activité Globale du Système';
    if(this.role === 'agent') return 'Dossiers Prioritaires à Traiter';
    return 'Mes Demandes Récentes';
  }

  getTableSubtitle(): string {
    if(this.role === 'admin') return 'Vue d\'ensemble des dernières activités';
    if(this.role === 'agent') return 'Actions requises de votre part';
    return 'Historique de vos soumissions';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}