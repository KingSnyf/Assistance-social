import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeService, Demande } from '../../../core/services/demande.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail-demande',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-page">

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement du dossier…</span>
      </div>

      <!-- ERREUR -->
      <div class="error-state" *ngIf="!loading && error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Dossier introuvable</h3>
        <p>{{ error }}</p>
        <button class="btn-back" (click)="goBack()">← Retour aux demandes</button>
      </div>

      <ng-container *ngIf="!loading && demande">

        <!-- TOPBAR -->
        <div class="topbar">
          <button class="btn-back-link" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retour
          </button>

          <div class="topbar-center">
            <span class="ref-pill">{{ demande.reference }}</span>
            <span class="badge" [class]="'badge-statut-' + demande.statut">{{ statutLabel(demande.statut) }}</span>
            <span class="badge" [class]="'badge-urgence-' + demande.urgence">{{ urgenceLabel(demande.urgence) }}</span>
          </div>

          <div class="topbar-actions" *ngIf="isAgent && demande.statut === 'soumise'">
            <button class="btn-approve" [disabled]="actionLoading" (click)="approuver()">
              <div class="mini-spinner" *ngIf="actionLoading === 'approuver'"></div>
              <svg *ngIf="actionLoading !== 'approuver'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Approuver
            </button>
            <button class="btn-reject" [disabled]="actionLoading" (click)="rejeter()">
              <div class="mini-spinner white" *ngIf="actionLoading === 'rejeter'"></div>
              <svg *ngIf="actionLoading !== 'rejeter'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rejeter
            </button>
          </div>
        </div>

        <!-- ALERT action -->
        <div class="alert-success" *ngIf="actionSuccess">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ actionSuccess }}
        </div>
        <div class="alert-error" *ngIf="actionError">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
          {{ actionError }}
        </div>

        <!-- GRID PRINCIPALE -->
        <div class="content-grid">

          <!-- COLONNE GAUCHE : infos principales -->
          <div class="col-main">

            <!-- Carte statut visuel -->
            <div class="status-banner" [class]="'banner-' + demande.statut">
              <div class="banner-icon">
                <svg *ngIf="demande.statut === 'approuvee'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <svg *ngIf="demande.statut === 'rejetee'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <svg *ngIf="demande.statut === 'en_cours'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <svg *ngIf="demande.statut === 'soumise'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div class="banner-title">{{ statutLabel(demande.statut) }}</div>
                <div class="banner-sub">
                  <span *ngIf="demande.statut === 'soumise'">En attente de traitement</span>
                  <span *ngIf="demande.statut === 'en_cours'">Dossier en cours d'instruction</span>
                  <span *ngIf="demande.statut === 'approuvee'">Demande accordée ✓</span>
                  <span *ngIf="demande.statut === 'rejetee'">Demande non retenue</span>
                </div>
              </div>
            </div>

            <!-- Motif -->
            <div class="info-card">
              <div class="card-header-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <h3>Motif de la demande</h3>
              </div>
              <p class="motif-text">{{ demande.motif }}</p>
            </div>

            <!-- Timeline -->
            <div class="info-card">
              <div class="card-header-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3>Historique du dossier</h3>
              </div>
              <div class="timeline">
                <div class="tl-item done">
                  <div class="tl-dot"></div>
                  <div class="tl-content">
                    <span class="tl-title">Demande soumise</span>
                    <span class="tl-date">{{ demande.date_soumission | date:'dd MMMM yyyy à HH:mm' }}</span>
                  </div>
                </div>
                <div class="tl-item" [class.done]="demande.statut === 'en_cours' || demande.statut === 'approuvee' || demande.statut === 'rejetee'">
                  <div class="tl-dot"></div>
                  <div class="tl-content">
                    <span class="tl-title">Prise en charge</span>
                    <span class="tl-date" *ngIf="demande.statut !== 'soumise'">Dossier instruit</span>
                    <span class="tl-date pending" *ngIf="demande.statut === 'soumise'">En attente</span>
                  </div>
                </div>
                <div class="tl-item" [class.done]="demande.statut === 'approuvee' || demande.statut === 'rejetee'" [class.rejected]="demande.statut === 'rejetee'">
                  <div class="tl-dot"></div>
                  <div class="tl-content">
                    <span class="tl-title">{{ demande.statut === 'rejetee' ? 'Demande rejetée' : 'Décision finale' }}</span>
                    <span class="tl-date" *ngIf="demande.date_traitement">{{ demande.date_traitement | date:'dd MMMM yyyy' }}</span>
                    <span class="tl-date pending" *ngIf="!demande.date_traitement && demande.statut === 'soumise'">En attente</span>
                    <span class="tl-date pending" *ngIf="!demande.date_traitement && demande.statut === 'en_cours'">En cours…</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- COLONNE DROITE : données chiffrées -->
          <div class="col-aside">

            <!-- Montant -->
            <div class="amount-card">
              <div class="amount-label">Montant demandé</div>
              <div class="amount-value">{{ demande.montant_demande | number:'1.0-0' }} <span class="currency">USD</span></div>
              <div class="amount-sub">Aide {{ typeAideLabel(demande.type_aide) | lowercase }}</div>
            </div>

            <!-- Détails rapides -->
            <div class="info-card">
              <div class="card-header-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h3>Informations</h3>
              </div>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-key">Référence</span>
                  <span class="info-val mono">{{ demande.reference }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Type d'aide</span>
                  <span class="info-val">{{ typeAideLabel(demande.type_aide) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Urgence</span>
                  <span class="info-val">
                    <span class="badge" [class]="'badge-urgence-' + demande.urgence">{{ urgenceLabel(demande.urgence) }}</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-key">Bénéficiaire</span>
                  <span class="info-val">{{ (demande.beneficiaire_prenom || '') + ' ' + (demande.beneficiaire_nom || '') || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Soumis le</span>
                  <span class="info-val">{{ demande.date_soumission | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-row" *ngIf="demande.date_traitement">
                  <span class="info-key">Traité le</span>
                  <span class="info-val">{{ demande.date_traitement | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .detail-page {
      padding: 28px 32px;
      min-height: 100vh;
      background: #f1f5f9;
      max-width: 1100px;
      margin: 0 auto;
    }

    /* LOADING / ERROR */
    .loading-state, .error-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 14px; padding: 100px 24px;
      color: #94a3b8; font-size: 14px; text-align: center;
    }
    .error-state h3 { color: #1e293b; font-size: 18px; margin: 0; }
    .error-state p  { color: #64748b; margin: 0; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #d1fae5; border-top-color: #166534;
      border-radius: 50%; animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* TOPBAR */
    .topbar {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 20px; flex-wrap: wrap;
    }
    .btn-back-link {
      display: inline-flex; align-items: center; gap: 6px;
      background: white; border: 1.5px solid #d1fae5;
      border-radius: 8px; padding: 8px 14px;
      font-size: 13px; font-weight: 600; color: #166534;
      cursor: pointer; transition: all 0.15s; text-decoration: none;
    }
    .btn-back-link:hover { border-color: #166534; background: #ecfdf3; }

    .topbar-center { display: flex; align-items: center; gap: 8px; flex: 1; flex-wrap: wrap; }

    .ref-pill {
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: #ecfdf3; color: #166534;
      border: 1px solid #d1fae5; border-radius: 6px;
      padding: 4px 10px; font-size: 13px; font-weight: 700;
    }

    .topbar-actions { display: flex; gap: 8px; margin-left: auto; }

    .btn-back {
      padding: 10px 20px; background: #166534; color: white;
      border: none; border-radius: 9px; font-size: 13.5px;
      font-weight: 700; cursor: pointer; margin-top: 8px;
    }

    /* BADGES */
    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    }
    .badge-statut-soumise   { background: #eff6ff; color: #2563eb; }
    .badge-statut-en_cours  { background: #fffbeb; color: #d97706; }
    .badge-statut-approuvee { background: #ecfdf3; color: #166534; }
    .badge-statut-rejetee   { background: #fef2f2; color: #dc2626; }
    .badge-urgence-urgent   { background: #fef2f2; color: #dc2626; }
    .badge-urgence-normal   { background: #fffbeb; color: #d97706; }
    .badge-urgence-faible   { background: #ecfdf3; color: #166534; }

    /* ACTION BUTTONS */
    .btn-approve {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 16px; background: #166534; color: white;
      border: none; border-radius: 8px; font-size: 13px;
      font-weight: 700; cursor: pointer; transition: all 0.15s;
    }
    .btn-approve:hover:not(:disabled) { background: #14532d; transform: translateY(-1px); }
    .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-reject {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 16px; background: #dc2626; color: white;
      border: none; border-radius: 8px; font-size: 13px;
      font-weight: 700; cursor: pointer; transition: all 0.15s;
    }
    .btn-reject:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

    .mini-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.65s linear infinite;
    }

    /* ALERTS */
    .alert-success, .alert-error {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 9px;
      font-size: 13.5px; font-weight: 500; margin-bottom: 16px;
    }
    .alert-success { background: #ecfdf3; border: 1px solid #d1fae5; color: #166534; }
    .alert-error   { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }

    /* STATUS BANNER */
    .status-banner {
      display: flex; align-items: center; gap: 16px;
      padding: 20px 22px; border-radius: 12px;
      margin-bottom: 16px; border: 1.5px solid;
    }
    .banner-soumise   { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
    .banner-en_cours  { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    .banner-approuvee { background: #ecfdf3; border-color: #d1fae5; color: #166534; }
    .banner-rejetee   { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

    .banner-icon {
      width: 52px; height: 52px; border-radius: 12px;
      background: rgba(255,255,255,0.7);
      display: grid; place-items: center; flex-shrink: 0;
    }
    .banner-title { font-size: 17px; font-weight: 800; margin-bottom: 2px; }
    .banner-sub   { font-size: 13px; opacity: 0.8; }

    /* GRID */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 16px;
      align-items: start;
    }

    /* CARDS */
    .info-card {
      background: white; border-radius: 12px;
      border: 1px solid #e8f5ee;
      box-shadow: 0 2px 10px rgba(15,42,31,0.07);
      padding: 20px; margin-bottom: 16px;
    }
    .info-card:last-child { margin-bottom: 0; }

    .card-header-line {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 16px; color: #166534;
    }
    .card-header-line h3 {
      font-size: 14px; font-weight: 700;
      color: #1e293b; margin: 0;
    }

    /* MOTIF */
    .motif-text {
      font-size: 14px; color: #374151; line-height: 1.75;
      white-space: pre-wrap; margin: 0;
      padding: 14px 16px; background: #f8fafc;
      border-radius: 8px; border-left: 3px solid #d1fae5;
    }

    /* TIMELINE */
    .timeline { display: flex; flex-direction: column; gap: 0; }

    .tl-item {
      display: flex; gap: 14px; padding-bottom: 20px;
      position: relative;
    }
    .tl-item:last-child { padding-bottom: 0; }
    .tl-item:not(:last-child)::before {
      content: ''; position: absolute;
      left: 7px; top: 18px; bottom: 0;
      width: 2px; background: #e2e8f0;
    }
    .tl-item.done:not(:last-child)::before { background: #d1fae5; }

    .tl-dot {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid #e2e8f0; background: white;
      flex-shrink: 0; margin-top: 2px;
      transition: all 0.2s;
    }
    .tl-item.done .tl-dot { background: #166534; border-color: #166534; }
    .tl-item.rejected .tl-dot { background: #dc2626; border-color: #dc2626; }

    .tl-content { display: flex; flex-direction: column; gap: 2px; }
    .tl-title { font-size: 13.5px; font-weight: 600; color: #1e293b; }
    .tl-date  { font-size: 12px; color: #94a3b8; }
    .tl-date.pending { color: #d97706; font-style: italic; }

    /* AMOUNT CARD */
    .amount-card {
      background: #0f2a1f; border-radius: 12px;
      padding: 24px; margin-bottom: 16px;
      text-align: center;
    }
    .amount-label { font-size: 12px; color: #6ee7b7; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .amount-value { font-size: 36px; font-weight: 800; color: white; line-height: 1; margin-bottom: 8px; }
    .currency     { font-size: 18px; color: #a7f3d0; font-weight: 600; }
    .amount-sub   { font-size: 13px; color: #6ee7b7; }

    /* INFO LIST */
    .info-list { display: flex; flex-direction: column; gap: 0; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid #f1f5f9;
      gap: 12px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-key { font-size: 12.5px; color: #94a3b8; font-weight: 500; flex-shrink: 0; }
    .info-val { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; }
    .mono {
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: #ecfdf3; color: #166534;
      border: 1px solid #d1fae5; border-radius: 5px;
      padding: 2px 7px; font-size: 11.5px;
    }

    @media (max-width: 768px) {
      .detail-page { padding: 16px; }
      .content-grid { grid-template-columns: 1fr; }
      .col-aside { order: -1; }
    }
  `]
})
export class DetailDemandeComponent implements OnInit {
  demande: Demande | null = null;
  loading = true;
  error = '';
  isAgent = false;
  actionLoading: string | null = null;
  actionSuccess = '';
  actionError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAgent = role === 'agent' || role === 'admin';

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Identifiant manquant.'; this.loading = false; return; }

    this.demandeService.getDemande(id).subscribe({
      next: (d) => { this.demande = d; this.loading = false; },
      error: (_e: HttpErrorResponse) => {
        this.error = 'Dossier introuvable ou accès refusé.';
        this.loading = false;
      }
    });
  }

  approuver(): void {
    if (!this.demande) return;
    this.actionLoading = 'approuver';
    this.actionSuccess = ''; this.actionError = '';
    this.demandeService.approuverDemande(this.demande.id).subscribe({
      next: () => {
        this.demande!.statut = 'approuvee';
        this.actionSuccess = 'Demande approuvée avec succès.';
        this.actionLoading = null;
      },
      error: (e: HttpErrorResponse) => {
        this.actionError = e.message || 'Erreur lors de l\'approbation.';
        this.actionLoading = null;
      }
    });
  }

  rejeter(): void {
    if (!this.demande) return;
    this.actionLoading = 'rejeter';
    this.actionSuccess = ''; this.actionError = '';
    this.demandeService.rejeterDemande(this.demande.id).subscribe({
      next: () => {
        this.demande!.statut = 'rejetee';
        this.actionSuccess = 'Demande rejetée.';
        this.actionLoading = null;
      },
      error: (e: HttpErrorResponse) => {
        this.actionError = e.message || 'Erreur lors du rejet.';
        this.actionLoading = null;
      }
    });
  }

  goBack(): void { this.router.navigate(['/demandes']); }

  statutLabel(s: string): string {
    return { soumise: 'Soumise', en_cours: 'En cours', approuvee: 'Approuvée', rejetee: 'Rejetée' }[s] || s;
  }
  urgenceLabel(s: string): string {
    return { urgent: '🔴 Urgent', normal: '🟡 Normal', faible: '🟢 Faible' }[s] || s;
  }
  typeAideLabel(s: string): string {
    return { financiere: 'Financière', alimentaire: 'Alimentaire', medicale: 'Médicale', logement: 'Logement', accompagnement: 'Accompagnement' }[s] || s;
  }
}