import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService, Demande } from '../../core/services/demande.service';

@Component({
    selector: 'app-demandes',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="page-container">
      <!-- En-tête -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des demandes</h1>
          <p class="page-subtitle">Liste complète des demandes d'aide</p>
        </div>
        <button routerLink="/nouvelle-demande" class="btn-primary">
          + Nouvelle demande
        </button>
      </div>

      <!-- État vide -->
      <div class="card empty-state" *ngIf="!loading && demandes.length === 0">
        <div class="empty-icon">📂</div>
        <h3>Aucune demande trouvée</h3>
        <p>Il n'y a pas encore de demandes enregistrées dans le système.</p>
        <button routerLink="/nouvelle-demande" class="btn-primary">Créer une demande</button>
      </div>

      <!-- Tableau de données -->
      <div class="card table-card" *ngIf="demandes.length > 0">
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
                <td class="mono">#{{ d.reference }}</td>
                <td class="fw-medium">{{ d.beneficiaire_nom || 'N/A' }}</td>
                <td>{{ d.type_aide | titlecase }}</td>
                <td>{{ d.montant_demande | number:'1.0-0' }} $</td>
                <td>
                  <span class="badge" [class]="getUrgenceClass(d.urgence)">
                    {{ d.urgence | uppercase }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class]="getStatutClass(d.statut)">
  {{ formatStatut(d.statut) }}
</span>
                </td>
                <td class="text-muted">{{ d.date_soumission | date:'dd MMM yyyy' }}</td>
                <td class="text-right">
                  <button class="btn-sm" (click)="viewDetails(d)">Détail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .page-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #2C3E50; margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: #7F8C8D; margin: 0; }
    
    .btn-primary { background: #4A90E2; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #357ABD; }
    
    .card { background: white; border: 1px solid #E1E8ED; border-radius: 12px; padding: 24px; }
    .table-responsive { overflow-x: auto; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; border-bottom: 2px solid #E1E8ED; font-size: 11px; text-transform: uppercase; color: #7F8C8D; font-weight: 600; background: #FAFBFC; }
    td { padding: 16px; border-bottom: 1px solid #F0F4F8; font-size: 14px; color: #34495E; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F8FAFC; }
    
    .mono { font-family: 'SF Mono', monospace; font-size: 12px; background: #E3F2FD; color: #1976D2; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .fw-medium { font-weight: 500; }
    .text-muted { color: #95A5A6; font-size: 13px; }
    .text-right { text-align: right; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    
    /* Urgence */
    .badge.urgent { background: #FFEBEE; color: #C62828; }
    .badge.normal { background: #FFF3E0; color: #E65100; }
    .badge.faible { background: #E8F5E9; color: #2E7D32; }
    
    /* Statut */
    .badge.approuvee { background: #E8F5E9; color: #2E7D32; }
    .badge.soumise { background: #E3F2FD; color: #1565C0; }
    .badge.rejetee { background: #FFEBEE; color: #C62828; }
    .badge.en_cours { background: #FFF3E0; color: #E65100; }

    .btn-sm { padding: 6px 12px; border: 1px solid #D0DCE5; border-radius: 6px; background: white; color: #5A6C7D; font-size: 12px; cursor: pointer; }
    .btn-sm:hover { border-color: #4A90E2; color: #4A90E2; }

    .empty-state { text-align: center; padding: 48px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { color: #2C3E50; margin: 0 0 8px; }
    .empty-state p { color: #7F8C8D; margin-bottom: 24px; }
  `]
})
export class DemandesComponent implements OnInit {
    demandes: Demande[] = [];
    loading = true;

    constructor(private demandeService: DemandeService) { }

    ngOnInit(): void {
        this.loadDemandes();
    }

    loadDemandes(): void {
        this.demandeService.getDemandes().subscribe({
            next: (data) => {
                this.demandes = data.results || data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur chargement:', err);
                this.loading = false;
            }
        });
    }

    getUrgenceClass(urgence: string): string {
        return `badge ${urgence}`;
    }

    getStatutClass(statut: string): string {
        return `badge ${statut}`;
    }

    viewDetails(demande: Demande): void {
        alert('Détails pour la demande : ' + demande.reference);
        // Ici vous pourriez router vers une page de détails
    }
    formatStatut(statut: string): string {
        return statut.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}