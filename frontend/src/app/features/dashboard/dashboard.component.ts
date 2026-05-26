import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { DemandeService, Demande } from '../../core/services/demande.service';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- TOPBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-sub">{{ subtitleByRole }}</p>
        </div>
        <div class="topbar-right">
          <button *ngIf="canCreateDemande" routerLink="/nouvelle-demande" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvelle demande
          </button>
          <div class="date-pill">{{ today }}</div>
        </div>
      </header>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner-lg"></div>
        <span>Chargement des données…</span>
      </div>

      <ng-container *ngIf="!loading">
        <!-- STAT CARDS -->
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let s of stats" [style.--accent]="s.color">
            <div class="stat-icon" [innerHTML]="s.icon"></div>
            <div class="stat-body">
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-sub" *ngIf="s.sub">{{ s.sub }}</div>
            </div>
          </div>
        </div>

        <!-- RECENT DEMANDES TABLE -->
        <div class="table-card">
          <div class="table-header">
            <div>
              <h2>{{ tableTitle }}</h2>
              <p>{{ tableSubtitle }}</p>
            </div>
            <a [routerLink]="tableLink" class="btn-outline-sm">Voir tout →</a>
          </div>

          <!-- empty -->
          <div class="empty-state" *ngIf="recentDemandes.length === 0">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Aucune demande à afficher pour le moment.</p>
          </div>

          <!-- table -->
          <div class="table-wrap" *ngIf="recentDemandes.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th *ngIf="isAdmin">Bénéficiaire</th>
                  <th>Type d'aide</th>
                  <th>Montant</th>
                  <th>Urgence</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of recentDemandes">
                  <td><span class="ref-badge">{{ d.reference }}</span></td>
                  <td *ngIf="isAdmin">{{ (d.beneficiaire_prenom || '') + ' ' + (d.beneficiaire_nom || '') }}</td>
                  <td>{{ typeAideLabel(d.type_aide) }}</td>
                  <td class="amount">{{ d.montant_demande | number:'1.0-0' }} $</td>
                  <td><span class="badge urgence-{{ d.urgence }}">{{ urgenceLabel(d.urgence) }}</span></td>
                  <td><span class="badge statut-{{ d.statut }}">{{ statutLabel(d.statut) }}</span></td>
                  <td class="date-cell">{{ d.date_soumission | date:'dd MMM yyyy' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role = 'citoyen';
  loading = true;
  recentDemandes: Demande[] = [];
  stats: StatCard[] = [];
  today = '';

  constructor(private auth: AuthService, private demandeService: DemandeService) {}

  get isAdmin(): boolean { return this.role === 'admin'; }
  get canCreateDemande(): boolean { return this.role === 'citoyen' || this.role === 'beneficiaire'; }

  get subtitleByRole(): string {
    const m: Record<string, string> = {
      admin: 'Administration système — Vue globale',
      agent: 'Espace agent — Dossiers en charge',
      citoyen: 'Espace citoyen — Suivi de vos demandes',
      beneficiaire: 'Espace bénéficiaire — Suivi de vos dossiers'
    };
    return m[this.role] || '';
  }

  get tableTitle(): string {
    return this.role === 'admin' ? 'Activité récente' : this.role === 'agent' ? 'Dossiers prioritaires' : 'Mes demandes récentes';
  }

  get tableSubtitle(): string {
    return this.role === 'admin' ? '5 dernières demandes' : 'Dernières mises à jour';
  }

  get tableLink(): string {
    return (this.role === 'citoyen' || this.role === 'beneficiaire') ? '/mes-demandes' : '/demandes';
  }

  ngOnInit(): void {
    this.role = this.auth.getUserRole();
    const now = new Date();
    this.today = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    this.demandeService.getDemandes().subscribe({
      next: (data) => {
        const all: Demande[] = data.results || data;
        this.recentDemandes = all.slice(0, 5);
        this.buildStats(all);
        this.loading = false;
      },
      error: (_err: HttpErrorResponse) => {
        this.loading = false;
        this.buildStats([]);
      }
    });
  }

  buildStats(demandes: Demande[]): void {
    const total = demandes.length;
    const enCours = demandes.filter(d => d.statut === 'en_cours' || d.statut === 'soumise').length;
    const approuvees = demandes.filter(d => d.statut === 'approuvee').length;
    const montantTotal = demandes.filter(d => d.statut === 'approuvee').reduce((s, d) => s + +d.montant_demande, 0);

    if (this.role === 'admin') {
      this.stats = [
        { label: 'Total demandes', value: total, color: '#6366f1', icon: iconDoc, sub: 'depuis le début' },
        { label: 'En attente', value: enCours, color: '#f59e0b', icon: iconClock },
        { label: 'Approuvées', value: approuvees, color: '#10b981', icon: iconCheck },
        { label: 'Montant accordé', value: montantTotal.toLocaleString('fr') + ' $', color: '#3b82f6', icon: iconDollar }
      ];
    } else if (this.role === 'agent') {
      this.stats = [
        { label: 'Dossiers totaux', value: total, color: '#6366f1', icon: iconDoc },
        { label: 'En attente', value: enCours, color: '#f59e0b', icon: iconClock },
        { label: 'Résolus', value: approuvees, color: '#10b981', icon: iconCheck },
        { label: 'Taux résolution', value: total > 0 ? Math.round(approuvees / total * 100) + '%' : 'N/A', color: '#3b82f6', icon: iconChart }
      ];
    } else {
      this.stats = [
        { label: 'Mes demandes', value: total, color: '#6366f1', icon: iconDoc },
        { label: 'En cours', value: enCours, color: '#f59e0b', icon: iconClock },
        { label: 'Approuvées', value: approuvees, color: '#10b981', icon: iconCheck },
        { label: 'Aide obtenue', value: montantTotal.toLocaleString('fr') + ' $', color: '#3b82f6', icon: iconDollar }
      ];
    }
  }

  typeAideLabel(v: string): string {
    const m: Record<string, string> = { financiere: 'Financière', alimentaire: 'Alimentaire', medicale: 'Médicale', logement: 'Logement', accompagnement: 'Accompagnement' };
    return m[v] || v;
  }

  urgenceLabel(v: string): string {
    return { urgent: 'Urgent', normal: 'Normal', faible: 'Faible' }[v] || v;
  }

  statutLabel(v: string): string {
    return { soumise: 'Soumise', en_cours: 'En cours', approuvee: 'Approuvée', rejetee: 'Rejetée' }[v] || v;
  }
}

const iconDoc = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const iconClock = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const iconCheck = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
const iconDollar = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const iconChart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;