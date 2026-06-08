import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { DemandeService, Demande } from '../../core/services/demande.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des demandes</h1>
          <p class="page-subtitle">Liste complète des demandes d'aide</p>
        </div>
        <button routerLink="/nouvelle-demande" class="btn-primary">+ Nouvelle demande</button>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement…</span>
      </div>

      <!-- VIDE -->
      <div class="card empty-state" *ngIf="!loading && demandes.length === 0">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1fae5" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h3>Aucune demande trouvée</h3>
        <p>Il n'y a pas encore de demandes enregistrées.</p>
        <button routerLink="/nouvelle-demande" class="btn-primary">Créer une demande</button>
      </div>

      <!-- TABLEAU -->
      <div class="card table-card" *ngIf="!loading && demandes.length > 0">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Bénéficiaire</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Urgence</th>
                <th>Statut</th>
                <th>Date</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of demandes">
                <td><span class="mono">#{{ d.reference }}</span></td>
                <td class="fw-medium">{{ d.beneficiaire_nom || 'N/A' }}</td>
                <td>{{ d.type_aide | titlecase }}</td>
                <td class="fw-bold">{{ d.montant_demande | number:'1.0-0' }} $</td>
                <td><span class="badge" [class]="'badge-urgence-' + d.urgence">{{ d.urgence | uppercase }}</span></td>
                <td><span class="badge" [class]="'badge-statut-' + d.statut">{{ formatStatut(d.statut) }}</span></td>
                <td class="text-muted">{{ d.date_soumission | date:'dd MMM yyyy' }}</td>
                <td class="text-right actions-cell">
                  <!-- Boutons approuver/rejeter (agents uniquement, demandes soumises) -->
                  <ng-container *ngIf="isAgent && d.statut === 'soumise'">
                    <button
                      class="btn-approve"
                      (click)="approuveDemande(d)"
                      [disabled]="actionInProgress === d.id">
                      ✓ Approuver
                    </button>
                    <button
                      class="btn-reject"
                      (click)="rejeteDemande(d)"
                      [disabled]="actionInProgress === d.id">
                      ✕ Rejeter
                    </button>
                  </ng-container>
                  <button class="btn-sm" (click)="viewDetails(d)">Détail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ERREUR -->
      <div class="alert-error" *ngIf="errorMsg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ errorMsg }}
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;
    }
    .page-title { font-size: 22px; font-weight: 800; color: #14532d; margin: 0 0 4px; letter-spacing: -0.4px; }
    .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }

    .btn-primary {
      background: #166534; color: white; border: none; padding: 10px 20px;
      border-radius: 9px; font-weight: 700; cursor: pointer; font-size: 13.5px;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
    }
    .btn-primary:hover { background: #14532d; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(22,101,52,0.28); }

    .card {
      background: white; border: 1px solid #e8f5ee; border-radius: 12px;
      padding: 24px; box-shadow: 0 2px 10px rgba(15,42,31,0.07);
    }
    .table-card { padding: 0; overflow: hidden; }

    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 11px 16px; border-bottom: 1px solid #f1f5f9;
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
      color: #94a3b8; font-weight: 700; background: #f8fafc;
    }
    td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; font-size: 13.5px; color: #374151; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fff9; }

    .mono {
      font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;
      background: #ecfdf3; color: #166534; padding: 3px 8px;
      border-radius: 5px; font-weight: 600; border: 1px solid #d1fae5;
    }
    .fw-medium { font-weight: 600; }
    .fw-bold   { font-weight: 700; color: #1e293b; }
    .text-muted { color: #94a3b8; font-size: 12.5px; }
    .text-right { text-align: right; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }

    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    }
    /* Urgence */
    .badge-urgence-urgent { background: #fef2f2; color: #dc2626; }
    .badge-urgence-normal { background: #fffbeb; color: #d97706; }
    .badge-urgence-faible { background: #ecfdf3; color: #166534; }
    /* Statut */
    .badge-statut-soumise   { background: #eff6ff; color: #2563eb; }
    .badge-statut-en_cours  { background: #fffbeb; color: #d97706; }
    .badge-statut-approuvee { background: #ecfdf3; color: #166534; }
    .badge-statut-rejetee   { background: #fef2f2; color: #dc2626; }

    .btn-sm {
      padding: 6px 12px; border: 1.5px solid #d1fae5; border-radius: 6px;
      background: white; color: #166534; font-size: 12px; cursor: pointer;
      font-weight: 600; transition: all 0.15s;
    }
    .btn-sm:hover { border-color: #166534; background: #ecfdf3; }

    .btn-approve {
      padding: 5px 11px; border: none; border-radius: 6px;
      background: #166534; color: white; font-size: 12px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-approve:hover:not(:disabled) { background: #14532d; }
    .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-reject {
      padding: 5px 11px; border: none; border-radius: 6px;
      background: #dc2626; color: white; font-size: 12px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-reject:hover:not(:disabled) { background: #b91c1c; }
    .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 52px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-state h3 { color: #14532d; margin: 0; }
    .empty-state p  { color: #64748b; margin: 0; }

    .loading-state {
      display: flex; align-items: center; justify-content: center;
      gap: 12px; padding: 64px; color: #94a3b8; font-size: 14px;
    }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #d1fae5;
      border-top-color: #166534; border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert-error {
      display: flex; align-items: center; gap: 10px; margin-top: 16px;
      padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 9px; color: #b91c1c; font-size: 13.5px; font-weight: 500;
    }
  `]
})
export class DemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading = true;
  errorMsg = '';

  // Propriétés pour la gestion des actions agent
  isAgent = false;
  actionInProgress: string | null = null;

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAgent = role === 'agent' || role === 'admin';
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.demandeService.getDemandes().subscribe({
      next: (data) => {
        this.demandes = data.results || data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMsg = 'Impossible de charger les demandes. Veuillez réessayer.';
        console.error('Erreur chargement:', error.message);
        this.loading = false;
      }
    });
  }

  approuveDemande(demande: Demande): void {
    if (this.actionInProgress) return;
    this.actionInProgress = demande.id;

    this.demandeService.approuverDemande(demande.id).subscribe({
      next: () => {
        demande.statut = 'approuvee';
        this.actionInProgress = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg = err.message || 'Erreur lors de l\'approbation.';
        this.actionInProgress = null;
      }
    });
  }

  rejeteDemande(demande: Demande): void {
    if (this.actionInProgress) return;
    this.actionInProgress = demande.id;

    this.demandeService.rejeterDemande(demande.id).subscribe({
      next: () => {
        demande.statut = 'rejetee';
        this.actionInProgress = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg = err.message || 'Erreur lors du rejet.';
        this.actionInProgress = null;
      }
    });
  }

  formatStatut(statut: string): string {
    const labels: Record<string, string> = {
      soumise: 'Soumise',
      en_cours: 'En cours',
      approuvee: 'Approuvée',
      rejetee: 'Rejetée'
    };
    return labels[statut] || statut;
  }

  viewDetails(demande: Demande): void {
    const base = this.isAgent ? '/demandes' : '/mes-demandes';
    this.router.navigate([base, demande.id]);
  }
}