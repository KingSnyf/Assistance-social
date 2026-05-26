import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BeneficiaireService, Beneficiaire } from '../../core/services/beneficiaire.service';

@Component({
  selector: 'app-beneficiaires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1>Bénéficiaires</h1>
          <p class="page-sub">{{ loading ? '…' : totalCount + ' bénéficiaire(s) enregistré(s)' }}</p>
        </div>
      </div>

      <!-- BARRE DE RECHERCHE -->
      <div class="search-bar">
        <div class="search-input-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilter()"
            placeholder="Rechercher par nom, email ou pays…"
          >
        </div>
        <button class="btn-reset" *ngIf="searchQuery" (click)="resetSearch()">
          Effacer
        </button>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner-ring"></div>
        <span>Chargement des bénéficiaires…</span>
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3>Aucun bénéficiaire trouvé</h3>
        <p>{{ searchQuery ? 'Aucun résultat pour "' + searchQuery + '"' : 'Aucun bénéficiaire enregistré pour le moment.' }}</p>
      </div>

      <!-- GRID DE CARDS -->
      <div class="cards-grid" *ngIf="!loading && !error && filtered.length > 0">
        <div class="benef-card" *ngFor="let b of filtered">

          <div class="card-top">
            <div class="avatar" [style.background]="avatarColor(b)">
              {{ initiales(b) }}
            </div>
            <div class="card-identity">
              <div class="card-name">{{ b.prenom }} {{ b.nom }}</div>
              <div class="card-pays" *ngIf="b.pays_residence">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                {{ b.pays_residence }}
              </div>
            </div>
          </div>

          <div class="card-details">
            <div class="detail-row" *ngIf="b.email">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{{ b.email }}</span>
            </div>
            <div class="detail-row" *ngIf="b.telephone">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 6.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{{ b.telephone }}</span>
            </div>
            <div class="detail-row no-info"
                 *ngIf="!b.email && !b.telephone">
              <span>Aucun contact renseigné</span>
            </div>
          </div>

        </div>
      </div>

      <!-- FOOTER COMPTEUR -->
      <div class="list-footer" *ngIf="!loading && filtered.length > 0">
        {{ filtered.length }} bénéficiaire(s) affiché(s)
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

    .page-sub {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
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

    .empty-state p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    /* ── CARDS GRID ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 16px;
    }

    .benef-card {
      background: white;
      border: 1px solid #e8edf3;
      border-radius: 14px;
      padding: 18px;
      transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    }

    .benef-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.07);
      border-color: #c7d7e9;
    }

    /* Top : avatar + identité */
    .card-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }

    .avatar {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }

    .card-identity { overflow: hidden; }

    .card-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-pays {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }

    /* Détails */
    .card-details {
      border-top: 1px solid #f0f4f8;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
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

    .no-info { color: #cbd5e1; font-style: italic; }

    /* Footer */
    .list-footer {
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
      text-align: right;
    }

    @media (max-width: 640px) {
      .page { padding: 16px; }
      .cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BeneficiairesComponent implements OnInit {
  beneficiaires: Beneficiaire[] = [];
  filtered:      Beneficiaire[] = [];
  loading    = true;
  error      = '';
  totalCount = 0;
  searchQuery = '';

  /* Palette de couleurs pour les avatars */
  private colors = [
    'linear-gradient(135deg,#6366f1,#4338ca)',
    'linear-gradient(135deg,#0ea5e9,#0369a1)',
    'linear-gradient(135deg,#10b981,#047857)',
    'linear-gradient(135deg,#f59e0b,#b45309)',
    'linear-gradient(135deg,#ef4444,#b91c1c)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    'linear-gradient(135deg,#ec4899,#be185d)',
    'linear-gradient(135deg,#14b8a6,#0f766e)',
  ];

  constructor(private beneficiaireService: BeneficiaireService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error   = '';
    this.beneficiaireService.getBeneficiaires().subscribe({
      next: (data) => {
        this.beneficiaires = data.results || data;
        this.totalCount    = data.count   || this.beneficiaires.length;
        this.filtered      = [...this.beneficiaires];
        this.loading       = false;
      },
      error: (_e: HttpErrorResponse) => {
        this.error   = 'Impossible de charger les bénéficiaires. Vérifiez votre connexion.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { this.filtered = [...this.beneficiaires]; return; }
    this.filtered = this.beneficiaires.filter(b =>
      b.nom.toLowerCase().includes(q)            ||
      b.prenom.toLowerCase().includes(q)         ||
      (b.email          || '').toLowerCase().includes(q) ||
      (b.pays_residence || '').toLowerCase().includes(q)
    );
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filtered = [...this.beneficiaires];
  }

  initiales(b: Beneficiaire): string {
    return ((b.prenom[0] || '') + (b.nom[0] || '')).toUpperCase();
  }

  avatarColor(b: Beneficiaire): string {
    /* Couleur déterministe basée sur le nom */
    const idx = (b.nom.charCodeAt(0) + (b.prenom.charCodeAt(0) || 0)) % this.colors.length;
    return this.colors[idx];
  }
}