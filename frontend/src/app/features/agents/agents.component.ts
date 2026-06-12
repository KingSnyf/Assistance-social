import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface Agent {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  template: `
    <div class="agents-container">

      <!-- HEADER -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Gestion des agents</h1>
          <span class="badge-count">{{ agents.length }}</span>
        </div>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement…</span>
      </div>

      <!-- ERREUR -->
      <div class="alert-error" *ngIf="error">{{ error }}</div>

      <!-- ACCÈS REFUSÉ -->
      <div class="empty-state" *ngIf="!loading && !isAdmin">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <p>Accès réservé aux administrateurs.</p>
      </div>

      <!-- VIDE -->
      <div class="empty-state" *ngIf="!loading && isAdmin && !error && agents.length === 0">
        <p>Aucun agent enregistré.</p>
      </div>

      <!-- TABLEAU -->
      <div class="table-wrapper" *ngIf="!loading && isAdmin && agents.length > 0">
        <table class="agents-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscription</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of agents">
              <td>
                <div class="agent-name">
                  <div class="avatar">{{ (a.first_name || a.username).charAt(0).toUpperCase() }}</div>
                  <span>{{ a.first_name }} {{ a.last_name || '' }}</span>
                </div>
              </td>
              <td class="email">{{ a.email }}</td>
              <td><span class="role-badge role-{{ a.role }}">{{ a.role }}</span></td>
              <td>
                <span class="status-dot" [class.active]="a.is_active">
                  {{ a.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="date">{{ a.date_joined | date:'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .agents-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-title { font-size: 1.6rem; font-weight: 700; color: #1a2e1a; margin: 0; }
    .badge-count { background: #e8f5e9; color: #2e7d32; font-size: .8rem; font-weight: 600; padding: 2px 10px; border-radius: 999px; }
    .loading-state { display: flex; align-items: center; gap: 12px; color: #666; padding: 40px 0; }
    .spinner { width: 24px; height: 24px; border: 3px solid #c8e6c9; border-top-color: #2e7d32; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .alert-error { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; color: #666; text-align: center; }
    .empty-state svg { color: #a5d6a7; }
    .table-wrapper { background: #fff; border: 1px solid #e8f5e9; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(46,125,50,.06); }
    .agents-table { width: 100%; border-collapse: collapse; }
    .agents-table thead { background: linear-gradient(135deg, #f1f8f1, #e8f5e9); }
    .agents-table th { padding: 12px 16px; text-align: left; font-size: .82rem; color: #2e7d32; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #c8e6c9; }
    .agents-table td { padding: 14px 16px; border-bottom: 1px solid #f1f8f1; font-size: .9rem; color: #1a2e1a; }
    .agents-table tr:last-child td { border-bottom: none; }
    .agents-table tr:hover td { background: #f9fdf9; }
    .agent-name { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: #2e7d32; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .9rem; flex-shrink: 0; }
    .email { color: #555; font-size: .85rem; }
    .date { color: #888; font-size: .82rem; }
    .role-badge { font-size: .72rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; text-transform: capitalize; }
    .role-admin { background: #fce4ec; color: #c62828; }
    .role-agent { background: #e8f5e9; color: #2e7d32; }
    .role-citoyen { background: #e3f2fd; color: #1565c0; }
    .status-dot { font-size: .8rem; font-weight: 600; }
    .status-dot.active { color: #2e7d32; }
    .status-dot:not(.active) { color: #999; }
  `]
})
export class AgentsComponent implements OnInit {
  agents: Agent[] = [];
  loading = true;
  error = '';
  role = '';

  get isAdmin(): boolean { return this.role === 'admin'; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getUserRole();
    if (!this.isAdmin) { this.loading = false; return; }
    this.http.get<any>(`${environment.apiUrl}/agents/`).subscribe({
      next: (data) => {
        this.agents = data.results || data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.detail || 'Erreur lors du chargement des agents.';
        this.loading = false;
      }
    });
  }
}