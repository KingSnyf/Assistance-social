import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeService, Demande } from '../../core/services/demande.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des demandes</h1>
          <p class="page-subtitle">Liste complète des demandes d'aide</p>
        </div>
        <button routerLink="/nouvelle-demande" class="btn-primary">+ Nouvelle demande</button>
      </div>

      <div class="card empty-state" *ngIf="!loading && demandes.length === 0">
        <div class="empty-icon"></div>
        <h3>Aucune demande trouvée</h3>
        <p>Il n'y a pas encore de demandes enregistrées.</p>
        <button routerLink="/nouvelle-demande" class="btn-primary">Créer une demande</button>
      </div>

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
                <td><span class="badge" [class]="'badge-' + d.urgence">{{ d.urgence | uppercase }}</span></td>
                <td><span class="badge" [class]="'badge-' + d.statut">{{ formatStatut(d.statut) }}</span></td>
                <td class="text-muted">{{ d.date_soumission | date:'dd MMM yyyy' }}</td>
                <td class="text-right"><button class="btn-sm" (click)="viewDetails(d)">Détail</button></td>
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
    .page-title { font-size: 24px; font-weight: 700; color: #0F172A; margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: #64748B; margin: 0; }
    .btn-primary { background: #2563EB; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #1D4ED8; }
    .card { background: white; border: 1px solid #E1E8ED; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; border-bottom: 2px solid #E1E8ED; font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; background: #F8FAFC; }
    td { padding: 16px; border-bottom: 1px solid #F0F4F8; font-size: 14px; color: #334155; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F8FAFC; }
    .mono { font-family: 'SF Mono', monospace; font-size: 12px; background: #EFF6FF; color: #2563EB; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .fw-medium { font-weight: 500; }
    .text-muted { color: #94A3B8; font-size: 13px; }
    .text-right { text-align: right; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-urgent { background: #FEF2F2; color: #DC2626; } .badge-normal { background: #FFFBEB; color: #D97706; } .badge-faible { background: #F0FDF4; color: #16A34A; }
    .badge-approuvee { background: #F0FDF4; color: #16A34A; } .badge-soumise { background: #EFF6FF; color: #2563EB; } .badge-rejetee { background: #FEF2F2; color: #DC2626; } .badge-en_cours { background: #FFFBEB; color: #D97706; }
    .btn-sm { padding: 6px 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: white; color: #475569; font-size: 12px; cursor: pointer; }
    .btn-sm:hover { border-color: #2563EB; color: #2563EB; }
    .empty-state { text-align: center; padding: 48px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { color: #0F172A; margin: 0 0 8px; }
    .empty-state p { color: #64748B; margin-bottom: 24px; }
  `]
})
export class DemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading = true;

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.demandeService.getDemandes().subscribe({
      next: (data) => {
        this.demandes = data.results || data;
        this.loading = false;
      },
      // ✅ TYPE STRICT
      error: (error: HttpErrorResponse) => {
        console.error('Erreur chargement:', error.message);
        this.loading = false;
      }
    });
  }

  formatStatut(statut: string): string {
    return statut.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  viewDetails(demande: Demande): void {
    alert('Détails pour : ' + demande.reference);
  }
}