import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeService, Demande } from '../../../core/services/demande.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail-demande',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Dossier introuvable</h3>
        <p>{{ error }}</p>
        <button class="btn-back" (click)="goBack()">← Retour aux demandes</button>
      </div>

      <!-- CONTENU -->
      <ng-container *ngIf="!loading && !error && demande">

        <!-- En-tête -->
        <div class="page-header">
          <div class="header-left">
            <button class="btn-back-sm" (click)="goBack()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Retour
            </button>
            <div>
              <div class="breadcrumb-row">
                <span class="bc-label">Demandes</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                <span class="bc-label">{{ demande.reference }}</span>
              </div>
              <h1 class="page-title">Dossier {{ demande.reference }}</h1>
            </div>
          </div>
          <div class="header-right">
            <span class="badge statut-{{ demande.statut }} badge-lg">{{ statutLabel(demande.statut) }}</span>
          </div>
        </div>

        <!-- Alertes actions -->
        <div class="alert alert-success" *ngIf="actionSuccess">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ actionSuccess }}
        </div>
        <div class="alert alert-error" *ngIf="actionError">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ actionError }}
        </div>

        <!-- Grille principale -->
        <div class="detail-grid">

          <!-- Colonne principale -->
          <div class="main-col">

            <!-- Infos générales -->
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Informations générales</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Référence</span>
                  <span class="info-value ref-badge">{{ demande.reference }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Type d'aide</span>
                  <span class="info-value">{{ typeAideLabel(demande.type_aide) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Montant demandé</span>
                  <span class="info-value amount">{{ demande.montant_demande | number:'1.0-0' }} FCFA</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Urgence</span>
                  <span class="badge urgence-{{ demande.urgence }}">{{ urgenceLabel(demande.urgence) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date de soumission</span>
                  <span class="info-value">{{ demande.date_soumission | date:'dd MMMM yyyy' }}</span>
                </div>
                <div class="info-item" *ngIf="demande.date_traitement">
                  <span class="info-label">Date de traitement</span>
                  <span class="info-value">{{ demande.date_traitement | date:'dd MMMM yyyy' }}</span>
                </div>
              </div>
            </div>

            <!-- Motif -->
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Motif de la demande</h2>
              </div>
              <p class="motif-text">{{ demande.motif }}</p>
            </div>

            <!-- Motif rejet si rejetée -->
            <div class="card card-danger" *ngIf="demande.statut === 'rejetee' && demande.motif_rejet">
              <div class="card-header">
                <h2 class="card-title">Motif du rejet</h2>
              </div>
              <p class="motif-text danger-text">{{ demande.motif_rejet }}</p>
            </div>

          </div>

          <!-- Colonne latérale -->
          <div class="side-col">

            <!-- Statut & Actions agent -->
            <div class="card" *ngIf="isAgent">
              <div class="card-header">
                <h2 class="card-title">Actions</h2>
              </div>

              <div class="actions-bloc" *ngIf="demande.statut === 'soumise' || demande.statut === 'en_cours'">

                <!-- Approuver -->
                <button
                  class="btn-action-full btn-approve"
                  (click)="approuver()"
                  [disabled]="actionLoading !== null"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ actionLoading === 'approuver' ? 'Approbation…' : 'Approuver' }}
                </button>

                <!-- Zone rejet -->
                <div class="rejet-zone">
                  <label class="rejet-label">Motif du rejet <span class="required">*</span></label>
                  <textarea
                    [(ngModel)]="motifRejet"
                    placeholder="Expliquez la raison du rejet (min. 10 caractères)…"
                    rows="3"
                    class="rejet-textarea"
                  ></textarea>
                  <div class="char-count" [class.error]="motifRejet.trim().length > 0 && motifRejet.trim().length < 10">
                    {{ motifRejet.trim().length }} caractères
                    <span *ngIf="motifRejet.trim().length > 0 && motifRejet.trim().length < 10"> (min. 10)</span>
                  </div>
                  <button
                    class="btn-action-full btn-reject"
                    (click)="rejeter()"
                    [disabled]="actionLoading !== null || motifRejet.trim().length < 10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {{ actionLoading === 'rejeter' ? 'Rejet…' : 'Rejeter' }}
                  </button>
                </div>
              </div>

              <!-- Statut final -->
              <div class="statut-final" *ngIf="demande.statut === 'approuvee' || demande.statut === 'rejetee'">
                <span class="badge statut-{{ demande.statut }} badge-lg">{{ statutLabel(demande.statut) }}</span>
                <p class="statut-note">Ce dossier a déjà été traité.</p>
              </div>
            </div>

            <!-- Bénéficiaire -->
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Bénéficiaire</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nom complet</span>
                  <span class="info-value">{{ (demande.beneficiaire_prenom || '') + ' ' + (demande.beneficiaire_nom || '') }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-page { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

    /* États */
    .loading-state, .error-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; padding: 80px 20px;
      color: #64748b; font-size: 14px;
    }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0;
      border-top-color: #166534; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Header */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px;
    }
    .header-left { display: flex; align-items: flex-start; gap: 16px; }
    .btn-back-sm {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 13px; font-weight: 600; color: #475569; cursor: pointer;
      transition: all 0.15s; white-space: nowrap; margin-top: 4px;
    }
    .btn-back-sm:hover { background: #f8fafc; border-color: #cbd5e1; }
    .breadcrumb-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
    .bc-label { font-weight: 600; }
    .page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .btn-back { padding: 10px 20px; background: #166534; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 8px; }

    /* Alertes */
    .alert {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      border-radius: 10px; font-size: 13.5px; font-weight: 600; margin-bottom: 20px;
    }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .alert-error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

    /* Grille */
    .detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
    .main-col, .side-col { display: flex; flex-direction: column; gap: 20px; }

    /* Cards */
    .card {
      background: white; border-radius: 14px; border: 1px solid #e8edf3;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden;
    }
    .card-danger { border-color: #fecaca; }
    .card-header { padding: 18px 22px 14px; border-bottom: 1px solid #f1f5f9; }
    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

    /* Info grid */
    .info-grid { padding: 16px 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
    .amount { color: #166534; font-weight: 700; }

    /* Motif */
    .motif-text { padding: 16px 22px; font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
    .danger-text { color: #dc2626; }

    /* Badges */
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 700; }
    .badge-lg { padding: 6px 16px; font-size: 13px; }
    .ref-badge { background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 6px; font-family: monospace; font-size: 13px; }
    .statut-soumise   { background: #eff6ff; color: #1d4ed8; }
    .statut-en_cours  { background: #fefce8; color: #a16207; }
    .statut-approuvee { background: #f0fdf4; color: #166534; }
    .statut-rejetee   { background: #fef2f2; color: #dc2626; }
    .urgence-urgent { background: #fef2f2; color: #dc2626; }
    .urgence-normal { background: #fefce8; color: #a16207; }
    .urgence-faible { background: #f0fdf4; color: #166534; }

    /* Actions */
    .actions-bloc { padding: 16px 22px; display: flex; flex-direction: column; gap: 12px; }
    .btn-action-full {
      width: 100%; display: flex; align-items: center; justify-content: center;
      gap: 8px; padding: 11px 16px; border-radius: 9px; border: none;
      font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s;
    }
    .btn-approve { background: #166534; color: white; }
    .btn-approve:hover:not(:disabled) { background: #15803d; }
    .btn-reject { background: #dc2626; color: white; }
    .btn-reject:hover:not(:disabled) { background: #b91c1c; }
    .btn-action-full:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Zone rejet */
    .rejet-zone { display: flex; flex-direction: column; gap: 8px; }
    .rejet-label { font-size: 12px; font-weight: 700; color: #475569; }
    .required { color: #dc2626; }
    .rejet-textarea {
      width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 13px; font-family: inherit; resize: vertical; color: #1e293b;
      box-sizing: border-box; transition: border 0.15s;
    }
    .rejet-textarea:focus { outline: none; border-color: #dc2626; }
    .char-count { font-size: 11px; color: #94a3b8; text-align: right; }
    .char-count.error { color: #dc2626; }

    /* Statut final */
    .statut-final { padding: 20px 22px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .statut-note { font-size: 12px; color: #94a3b8; margin: 0; }

    /* Responsive */
    @media (max-width: 768px) {
      .detail-page { padding: 16px; }
      .detail-grid { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
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
  motifRejet = '';

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
      next: (d: Demande) => { this.demande = d; this.loading = false; },
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
    if (!this.motifRejet || this.motifRejet.trim().length < 10) {
      this.actionError = 'Le motif de rejet doit contenir au moins 10 caractères.';
      return;
    }
    this.actionLoading = 'rejeter';
    this.actionSuccess = ''; this.actionError = '';
    this.demandeService.rejeterDemande(this.demande.id, this.motifRejet).subscribe({
      next: () => {
        this.demande!.statut = 'rejetee';
        this.demande!.motif_rejet = this.motifRejet;
        this.actionSuccess = 'Demande rejetée avec succès.';
        this.actionLoading = null;
        this.motifRejet = '';
      },
      error: (e: HttpErrorResponse) => {
        this.actionError = e.message || 'Erreur lors du rejet.';
        this.actionLoading = null;
      }
    });
  }

  goBack(): void { this.router.navigate(['/demandes']); }

  typeAideLabel(v: string): string {
    return ({ financiere: 'Financière', alimentaire: 'Alimentaire', medicale: 'Médicale', logement: 'Logement', accompagnement: 'Accompagnement' } as any)[v] || v;
  }
  urgenceLabel(v: string): string { return ({ urgent: 'Urgent', normal: 'Normal', faible: 'Faible' } as any)[v] || v; }
  statutLabel(v: string): string  { return ({ soumise: 'Soumise', en_cours: 'En cours', approuvee: 'Approuvée', rejetee: 'Rejetée' } as any)[v] || v; }
}