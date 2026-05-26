import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Agent {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  demandes_count?: number;
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1>Gestion des agents</h1>
          <p class="page-sub">
            {{ loading ? '…' : totalCount + ' agent(s) enregistré(s)' }}
          </p>
        </div>
        <div class="header-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Créer des agents via l'interface Admin Django</span>
        </div>
      </div>

      <!-- BARRE DE RECHERCHE -->
      <div class="search-bar">
        <div class="search-input-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilter()"
            placeholder="Rechercher par nom ou email…"
          >
        </div>
        <button class="btn-reset" *ngIf="searchQuery" (click)="resetSearch()">
          Effacer
        </button>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner-ring"></div>
        <span>Chargement des agents…</span>
      </div>

      <!-- ERREUR -->
      <div class="alert-error" *ngIf="!loading && error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
        <button class="retry-btn" (click)="load()">Réessayer</button>
      </div>

      <!-- VIDE -->
      <div class="empty-state" *ngIf="!loading && !error && filtered.length === 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <h3>Aucun agent trouvé</h3>
        <p>{{ searchQuery ? 'Aucun résultat pour "' + searchQuery + '".' : 'Aucun agent enregistré pour le moment.' }}</p>
        <a class="btn-admin" href="/admin/auth/user/" target="_blank">
          Ouvrir l'interface Admin →
        </a>
      </div>

      <!-- GRID DE CARDS -->
      <div class="cards-grid" *ngIf="!loading && !error && filtered.length > 0">
        <div class="agent-card" *ngFor="let a of filtered">

          <div class="card-top">
            <div class="avatar" [style.background]="avatarColor(a)">
              {{ initiales(a) }}
            </div>
            <div class="card-identity">
              <div class="card-name">
                {{ a.first_name || a.last_name
                   ? (a.first_name + ' ' + a.last_name).trim()
                   : a.username }}
              </div>
              <div class="card-username">&#64;{{ a.username }}</div>
            </div>
            <span class="status-badge" [class.active]="a.is_active" [class.inactive]="!a.is_active">
              {{ a.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <div class="card-details">
            <div class="detail-row" *ngIf="a.email">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{{ a.email }}</span>
            </div>
            <div class="detail-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Depuis le {{ a.date_joined | date:'dd MMM yyyy' }}</span>
            </div>
          </div>

          <!-- Rôle badge -->
          <div class="card-footer">
            <span class="role-tag">Agent social</span>
          </div>

        </div>
      </div>

      <!-- FOOTER -->
      <div class="list-footer" *ngIf="!loading && filtered.length > 0">
        {{ filtered.length }} agent(s) affiché(s)
        <span *ngIf="searchQuery"> · filtre : "{{ searchQuery }}"</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      padding: 32px;
      max-width: 1100px;
      margin: 0 auto;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* ── HEADER ── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .page-sub { font-size: 13px; color: #94a3b8; margin: 0; }

    .header-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      font-size: 12px;
      color: #92400e;
      font-weight: 500;
    }

    /* ── SEARCH ── */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 420px;
    }

    .search-input-wrap svg {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input-wrap input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 13.5px;
      font-family: inherit;
      background: white;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .search-input-wrap input:focus {
      border-color: #1e3a5f;
      box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
    }

    .btn-reset {
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }

    .btn-reset:hover { border-color: #94a3b8; color: #374151; }

    /* ── LOADING ── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 72px;
      color: #94a3b8;
      font-size: 14px;
    }

    .spinner-ring {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #1e3a5f;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── ALERTES ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #b91c1c;
      font-size: 13.5px;
      margin-bottom: 16px;
    }

    .retry-btn {
      margin-left: auto;
      padding: 5px 12px;
      background: white;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #b91c1c;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    /* ── VIDE ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 72px 32px;
      background: white;
      border: 1px solid #e8edf3;
      border-radius: 14px;
      text-align: center;
    }

    .empty-state h3 {
      font-size: 16px;
      font-weight: 700;
      color: #374151;
      margin: 4px 0 0;
    }

    .empty-state p { font-size: 14px; color: #94a3b8; margin: 0; }

    .btn-admin {
      display: inline-block;
      margin-top: 8px;
      padding: 9px 18px;
      background: #1e3a5f;
      color: white;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-admin:hover { background: #0f2a47; }

    /* ── CARDS GRID ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 16px;
    }

    .agent-card {
      background: white;
      border: 1px solid #e8edf3;
      border-radius: 14px;
      padding: 18px;
      transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    }

    .agent-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.07);
      border-color: #c7d7e9;
    }

    /* Top */
    .card-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }

    .card-identity { flex: 1; overflow: hidden; }

    .card-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-username {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .status-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 99px;
      flex-shrink: 0;
    }

    .status-badge.active   { background: #f0fdf4; color: #16a34a; }
    .status-badge.inactive { background: #f1f5f9; color: #94a3b8; }

    /* Détails */
    .card-details {
      border-top: 1px solid #f0f4f8;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: #475569;
    }

    .detail-row svg { color: #94a3b8; flex-shrink: 0; }

    .detail-row span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Footer card */
    .card-footer {
      border-top: 1px solid #f0f4f8;
      padding-top: 10px;
    }

    .role-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 99px;
      background: rgba(56,189,248,0.12);
      color: #0369a1;
    }

    /* Footer page */
    .list-footer {
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
      text-align: right;
    }

    @media (max-width: 640px) {
      .page { padding: 16px; }
      .cards-grid { grid-template-columns: 1fr; }
      .header-hint { display: none; }
    }
  `]
})
export class AgentsComponent implements OnInit {
  agents:     Agent[] = [];
  filtered:   Agent[] = [];
  loading    = true;
  error      = '';
  totalCount = 0;
  searchQuery = '';

  private colors = [
    'linear-gradient(135deg,#6366f1,#4338ca)',
    'linear-gradient(135deg,#0ea5e9,#0369a1)',
    'linear-gradient(135deg,#10b981,#047857)',
    'linear-gradient(135deg,#f59e0b,#b45309)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    'linear-gradient(135deg,#ec4899,#be185d)',
    'linear-gradient(135deg,#14b8a6,#0f766e)',
    'linear-gradient(135deg,#ef4444,#b91c1c)',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error   = '';
    /* Endpoint agents : filtre sur les users avec rôle agent via l'API custom */
    this.http.get<any>(`${environment.apiUrl}/agents/`).subscribe({
      next: (data) => {
        this.agents    = data.results || data;
        this.totalCount = data.count  || this.agents.length;
        this.filtered  = [...this.agents];
        this.loading   = false;
      },
      error: (_e: HttpErrorResponse) => {
        this.error   = 'Impossible de charger les agents. Vérifiez que l\'endpoint /api/agents/ existe.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { this.filtered = [...this.agents]; return; }
    this.filtered = this.agents.filter(a =>
      a.username.toLowerCase().includes(q)               ||
      (a.first_name || '').toLowerCase().includes(q)     ||
      (a.last_name  || '').toLowerCase().includes(q)     ||
      (a.email      || '').toLowerCase().includes(q)
    );
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filtered = [...this.agents];
  }

  initiales(a: Agent): string {
    if (a.first_name && a.last_name)
      return (a.first_name[0] + a.last_name[0]).toUpperCase();
    return a.username.slice(0, 2).toUpperCase();
  }

  avatarColor(a: Agent): string {
    const idx = a.username.charCodeAt(0) % this.colors.length;
    return this.colors[idx];
  }
}