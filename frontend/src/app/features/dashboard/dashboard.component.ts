import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { DemandeService, Demande } from '../../core/services/demande.service';

declare var Chart: any;

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard">
      <header class="db-topbar">
        <div class="db-topbar-left">
          <div class="page-breadcrumb">
            <span class="bc-section">GESTION</span>
            <span class="bc-tag">KPI</span>
          </div>
          <h1 class="page-title">Dashboard de pilotage</h1>
          <p class="page-sub">{{ subtitleByRole }}</p>
        </div>
        <div class="db-topbar-right">
          <div class="filter-group">
            <label>Du</label>
            <input type="date" [(ngModel)]="dateFrom" (change)="applyFilters()" class="date-input" />
            <label>Au</label>
            <input type="date" [(ngModel)]="dateTo" (change)="applyFilters()" class="date-input" />
            <button class="btn-filter" (click)="applyFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtrer
            </button>
            <button class="btn-reset" (click)="resetFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              Réinitialiser
            </button>
          </div>
          <button *ngIf="canCreateDemande" routerLink="/demandes/nouvelle" class="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle demande
          </button>
        </div>
      </header>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner-lg"></div>
        <span>Chargement des données…</span>
      </div>

      <ng-container *ngIf="!loading">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let s of stats" [style.--accent]="s.color">
            <div class="stat-top">
              <div class="stat-icon" [innerHTML]="sanitizeHtml(s.icon)"></div>
              <div class="stat-trend" *ngIf="s.trend" [class.up]="s.trendUp" [class.down]="!s.trendUp">
                <svg *ngIf="s.trendUp" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                <svg *ngIf="!s.trendUp" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                {{ s.trend }}
              </div>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-sub" *ngIf="s.sub">{{ s.sub }}</div>
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-card chart-wide">
            <div class="chart-card-header">
              <div>
                <p class="chart-section-label">ACTIVITÉ</p>
                <h2 class="chart-title">Évolution des demandes</h2>
              </div>
              <div class="period-tabs">
                <button [class.active]="chartPeriod==='semaine'" (click)="setPeriod('semaine')">Semaine</button>
                <button [class.active]="chartPeriod==='mois'" (click)="setPeriod('mois')">Mois</button>
              </div>
            </div>
            <div class="legend-row">
              <span class="legend-item"><span class="legend-dot" style="background:#166534"></span>Soumises</span>
              <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>En cours</span>
              <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Approuvées</span>
            </div>
            <div style="position:relative; width:100%; height:220px; overflow:hidden;">
              <canvas id="lineChart"></canvas>
            </div>
          </div>

          <div class="chart-card chart-narrow">
            <div class="chart-card-header">
              <div>
                <p class="chart-section-label">RÉPARTITION</p>
                <h2 class="chart-title">Par type d'aide</h2>
              </div>
            </div>
            <div style="position:relative; width:100%; height:180px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              <canvas id="donutChart"></canvas>
            </div>
            <div class="donut-legend" id="donutLegend"></div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="table-card">
            <div class="table-header">
              <div>
                <p class="chart-section-label">{{ tableSection }}</p>
                <h2>{{ tableTitle }}</h2>
                <p class="table-sub">{{ tableSubtitle }}</p>
              </div>
              <a [routerLink]="tableLink" class="btn-outline-sm">Voir tout →</a>
            </div>

            <div class="empty-state" *ngIf="filteredDemandes.length === 0">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>Aucune demande à afficher.</p>
            </div>

            <div class="table-wrap" *ngIf="filteredDemandes.length > 0">
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
                    <th *ngIf="role === 'admin' || role === 'agent'">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <ng-container *ngFor="let d of filteredDemandes.slice(0,6)">
                    <tr>
                      <td><span class="ref-badge">{{ d.reference }}</span></td>
                      <td *ngIf="isAdmin">{{ (d.beneficiaire_prenom || '') + ' ' + (d.beneficiaire_nom || '') }}</td>
                      <td>{{ typeAideLabel(d.type_aide) }}</td>
                      <td class="amount">{{ d.montant_demande | number:'1.0-0' }} FCFA</td>
                      <td><span class="badge urgence-{{ d.urgence }}">{{ urgenceLabel(d.urgence) }}</span></td>
                      <td><span class="badge statut-{{ d.statut }}">{{ statutLabel(d.statut) }}</span></td>
                      <td class="date-cell">{{ d.date_soumission | date:'dd MMM yyyy' }}</td>
                      <td *ngIf="role === 'admin' || role === 'agent'">
                        <div class="action-buttons" *ngIf="d.statut === 'soumise' || d.statut === 'en_cours'">
                          <button class="btn-action btn-approve" (click)="approuverDemande(d)" title="Approuver">✅</button>
                          <button class="btn-action btn-reject" (click)="toggleRejetForm(d.id)" title="Rejeter">❌</button>
                        </div>
                        <span *ngIf="d.statut === 'rejetee'" class="rejet-info-mini" [title]="d.motif_rejet || ''">
                          Motif: {{ (d.motif_rejet || '') | slice:0:30 }}{{ d.motif_rejet && d.motif_rejet.length > 30 ? '...' : '' }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="showRejetFormId === d.id" class="rejet-form-row">
                      <td [attr.colspan]="isAdmin ? 8 : 7">
                        <div class="rejet-form-inline">
                          <label>Motif du rejet (min. 10 caractères) :</label>
                          <textarea [(ngModel)]="motifRejet" placeholder="Ex: Documents incomplets..." rows="2" class="rejet-textarea"></textarea>
                          <div class="rejet-counter" [class.error]="motifRejet.trim().length < 10">
                            {{ motifRejet.trim().length }} / 10 caractères
                          </div>
                          <div class="rejet-actions">
                            <button class="btn-cancel" (click)="toggleRejetForm(d.id)">Annuler</button>
                            <button class="btn-confirm-rejet" (click)="confirmerRejet(d)" [disabled]="motifRejet.trim().length < 10">
                              Confirmer le rejet
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <div class="urgences-card">
            <div class="chart-card-header" style="margin-bottom:16px">
              <div>
                <p class="chart-section-label">PRIORITÉ</p>
                <h2 class="chart-title">Niveau d'urgence</h2>
              </div>
            </div>
            <div class="urgence-bars">
              <div class="urgence-bar-item">
                <div class="ub-label">
                  <span class="ub-dot urgent"></span><span>Urgent</span><span class="ub-val">{{ urgentCount }}</span>
                </div>
                <div class="ub-track"><div class="ub-fill urgent-fill" [style.width.%]="urgentPct"></div></div>
                <span class="ub-pct">{{ urgentPct | number:'1.0-0' }}%</span>
              </div>
              <div class="urgence-bar-item">
                <div class="ub-label">
                  <span class="ub-dot normal"></span><span>Normal</span><span class="ub-val">{{ normalCount }}</span>
                </div>
                <div class="ub-track"><div class="ub-fill normal-fill" [style.width.%]="normalPct"></div></div>
                <span class="ub-pct">{{ normalPct | number:'1.0-0' }}%</span>
              </div>
              <div class="urgence-bar-item">
                <div class="ub-label">
                  <span class="ub-dot faible"></span><span>Faible</span><span class="ub-val">{{ faibleCount }}</span>
                </div>
                <div class="ub-track"><div class="ub-fill faible-fill" [style.width.%]="faiblePct"></div></div>
                <span class="ub-pct">{{ faiblePct | number:'1.0-0' }}%</span>
              </div>
            </div>
            <div class="taux-bloc">
              <div class="taux-item">
                <div class="taux-val" style="color:#10b981">{{ tauxApprobation | number:'1.0-0' }}%</div>
                <div class="taux-lbl">Taux d'approbation</div>
              </div>
              <div class="taux-sep"></div>
              <div class="taux-item">
                <div class="taux-val" style="color:#f59e0b">{{ tauxEnCours | number:'1.0-0' }}%</div>
                <div class="taux-lbl">En traitement</div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  role = 'citoyen';
  loading = true;
  allDemandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  stats: StatCard[] = [];
  today = '';
  dateFrom = '';
  dateTo = '';
  chartPeriod: 'semaine' | 'mois' = 'mois';

  showRejetFormId: string | null = null;
  motifRejet: string = '';

  private lineChart: any = null;
  private donutChart: any = null;
  private chartsReady = false;
  private dataReady = false;

  urgentCount = 0; normalCount = 0; faibleCount = 0;
  urgentPct = 0; normalPct = 0; faiblePct = 0;
  tauxApprobation = 0; tauxEnCours = 0;

  constructor(
    private auth: AuthService,
    private demandeService: DemandeService,
    private sanitizer: DomSanitizer
  ) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get isAdmin(): boolean { return this.role === 'admin'; }
  get canCreateDemande(): boolean { return this.role === 'citoyen' || this.role === 'beneficiaire'; }

  get subtitleByRole(): string {
    const m: Record<string, string> = {
      admin: 'Synthèse de l\'activité, des demandes et des indicateurs globaux.',
      agent: 'Vue des dossiers en charge et indicateurs de traitement.',
      citoyen: 'Suivi de vos demandes d\'assistance sociale.',
      beneficiaire: 'Suivi de vos dossiers et aides obtenues.'
    };
    return m[this.role] || '';
  }

  get tableSection(): string { return this.role === 'admin' ? 'ACTIVITÉ RÉCENTE' : 'MES DOSSIERS'; }
  get tableTitle(): string {
    return this.role === 'admin' ? 'Activité récente' : this.role === 'agent' ? 'Dossiers prioritaires' : 'Mes demandes récentes';
  }
  get tableSubtitle(): string {
    return this.role === 'admin' ? '6 dernières demandes' : 'Dernières mises à jour';
  }
  get tableLink(): string {
    return (this.role === 'citoyen' || this.role === 'beneficiaire') ? '/mes-demandes' : '/demandes';
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.role = this.auth.getUserRole();
    const now = new Date();
    this.today = now.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    this.demandeService.getDemandes().subscribe({
      next: (data: any) => {
        this.allDemandes = data.results || data;
        this.filteredDemandes = [...this.allDemandes];
        this.buildStats(this.filteredDemandes);
        this.buildUrgences(this.filteredDemandes);
        this.loading = false;
        this.dataReady = true;
        if (this.chartsReady) this.renderCharts();
      },
      error: (_err: HttpErrorResponse) => {
        this.allDemandes = this.getMockData();
        this.filteredDemandes = [...this.allDemandes];
        this.buildStats(this.filteredDemandes);
        this.buildUrgences(this.filteredDemandes);
        this.loading = false;
        this.dataReady = true;
        if (this.chartsReady) this.renderCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    // 500ms : laisse le temps au router-outlet imbriqué + layout de se stabiliser
    setTimeout(() => {
      this.loadChartJs().then(() => {
        this.chartsReady = true;
        if (this.dataReady) this.renderCharts();
      });
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.lineChart) { this.lineChart.destroy(); this.lineChart = null; }
    if (this.donutChart) { this.donutChart.destroy(); this.donutChart = null; }
  }

  // ═══════════════════════════════════════════════════════════════
  // CHARTS
  // ═══════════════════════════════════════════════════════════════

  loadChartJs(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).Chart) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  setPeriod(p: 'semaine' | 'mois'): void {
    this.chartPeriod = p;
    this.renderLineChart(this.filteredDemandes);
  }

  renderCharts(): void {
    setTimeout(() => {
      this.renderLineChart(this.filteredDemandes);
      this.renderDonutChart(this.filteredDemandes);
    }, 100);
  }

  renderLineChart(demandes: Demande[]): void {
    const C = (window as any).Chart;
    if (!C) return;
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.lineChart) { this.lineChart.destroy(); this.lineChart = null; }

    // Forcer les dimensions pour éviter le bug dans les conteneurs overflow:auto
    const parentW = canvas.parentElement?.clientWidth || 600;
    canvas.width  = parentW;
    canvas.height = 220;

    const labels = this.chartPeriod === 'mois'
      ? ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']
      : ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    const soumises   = labels.map((_, i) => this.countByPeriod(demandes, 'soumise', i));
    const enCours    = labels.map((_, i) => this.countByPeriod(demandes, 'en_cours', i));
    const approuvees = labels.map((_, i) => this.countByPeriod(demandes, 'approuvee', i));

    this.lineChart = new C(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Soumises',   data: soumises,   borderColor: '#166534', backgroundColor: 'rgba(22,101,52,0.08)',  tension: 0.4, fill: true,  pointRadius: 4, pointBackgroundColor: '#166534' },
          { label: 'En cours',   data: enCours,    borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.06)', tension: 0.4, fill: false, borderDash: [4,4], pointRadius: 3, pointBackgroundColor: '#f59e0b' },
          { label: 'Approuvées', data: approuvees, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', tension: 0.4, fill: false, borderDash: [6,3], pointRadius: 3, pointBackgroundColor: '#10b981' }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#94a3b8', autoSkip: false, maxRotation: 0 } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#94a3b8', stepSize: 1 } }
        }
      }
    });
  }

  renderDonutChart(demandes: Demande[]): void {
    const C = (window as any).Chart;
    if (!C) return;
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.donutChart) { this.donutChart.destroy(); this.donutChart = null; }

    canvas.width  = 180;
    canvas.height = 180;

    const types  = ['financiere','alimentaire','medicale','logement','accompagnement'];
    const labels = ['Financière','Alimentaire','Médicale','Logement','Accompagnement'];
    const colors = ['#166534','#10b981','#3b82f6','#f59e0b','#8b5cf6'];
    const data   = types.map(t => demandes.filter(d => d.type_aide === t).length);
    const total  = data.reduce((a, b) => a + b, 0) || 1;

    this.donutChart = new C(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverBorderWidth: 3 }] },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / total * 100)}%)` } }
        }
      }
    });

    const legendEl = document.getElementById('donutLegend');
    if (legendEl) {
      legendEl.innerHTML = labels.map((l, i) =>
        `<span class="dl-item"><span class="dl-dot" style="background:${colors[i]}"></span>${l} <strong>${Math.round(data[i] / total * 100)}%</strong></span>`
      ).join('');
    }
  }

  countByPeriod(demandes: Demande[], statut: string, idx: number): number {
    return demandes.filter(d => {
      if (d.statut !== statut) return false;
      const date = new Date(d.date_soumission);
      return this.chartPeriod === 'mois'
        ? date.getMonth() === idx
        : date.getDay() === (idx + 1) % 7;
    }).length;
  }

  // ═══════════════════════════════════════════════════════════════
  // FILTRES
  // ═══════════════════════════════════════════════════════════════

  applyFilters(): void {
    let filtered = [...this.allDemandes];
    if (this.dateFrom) filtered = filtered.filter(d => d.date_soumission >= this.dateFrom);
    if (this.dateTo)   filtered = filtered.filter(d => d.date_soumission <= this.dateTo);
    this.filteredDemandes = filtered;
    this.buildStats(filtered);
    this.buildUrgences(filtered);
    if (this.chartsReady) this.renderCharts();
  }

  resetFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredDemandes = [...this.allDemandes];
    this.buildStats(this.filteredDemandes);
    this.buildUrgences(this.filteredDemandes);
    if (this.chartsReady) this.renderCharts();
  }

  // ═══════════════════════════════════════════════════════════════
  // STATS & URGENCES
  // ═══════════════════════════════════════════════════════════════

  buildUrgences(demandes: Demande[]): void {
    const total = demandes.length || 1;
    this.urgentCount = demandes.filter(d => d.urgence === 'urgent').length;
    this.normalCount = demandes.filter(d => d.urgence === 'normal').length;
    this.faibleCount = demandes.filter(d => d.urgence === 'faible').length;
    this.urgentPct = (this.urgentCount / total) * 100;
    this.normalPct = (this.normalCount / total) * 100;
    this.faiblePct = (this.faibleCount / total) * 100;
    const approuvees = demandes.filter(d => d.statut === 'approuvee').length;
    const enCours    = demandes.filter(d => d.statut === 'en_cours' || d.statut === 'soumise').length;
    this.tauxApprobation = (approuvees / total) * 100;
    this.tauxEnCours     = (enCours / total) * 100;
  }

  buildStats(demandes: Demande[]): void {
    const total       = demandes.length;
    const enCours     = demandes.filter(d => d.statut === 'en_cours' || d.statut === 'soumise').length;
    const approuvees  = demandes.filter(d => d.statut === 'approuvee').length;
    const montantTotal = demandes.filter(d => d.statut === 'approuvee').reduce((s, d) => s + +d.montant_demande, 0);

    if (this.role === 'admin') {
      this.stats = [
        { label: 'Total demandes', value: total, color: '#166534', icon: iconDoc, trend: '+12%', trendUp: true, sub: 'depuis le début' },
        { label: 'En attente', value: enCours, color: '#f59e0b', icon: iconClock, trend: enCours > 0 ? 'actif' : '—', trendUp: false },
        { label: 'Approuvées', value: approuvees, color: '#10b981', icon: iconCheck, trend: total > 0 ? Math.round(approuvees/total*100)+'%' : '0%', trendUp: true },
        { label: 'Montant accordé', value: montantTotal.toLocaleString('fr') + ' FCFA', color: '#3b82f6', icon: iconDollar, sub: 'aides approuvées' }
      ];
    } else if (this.role === 'agent') {
      this.stats = [
        { label: 'Dossiers assignés', value: total, color: '#166534', icon: iconDoc, sub: 'total dossiers' },
        { label: 'En attente', value: enCours, color: '#f59e0b', icon: iconClock },
        { label: 'Résolus', value: approuvees, color: '#10b981', icon: iconCheck },
        { label: 'Taux résolution', value: total > 0 ? Math.round(approuvees/total*100)+'%' : 'N/A', color: '#3b82f6', icon: iconChart, trendUp: true }
      ];
    } else {
      this.stats = [
        { label: 'Mes demandes', value: total, color: '#166534', icon: iconDoc },
        { label: 'En cours', value: enCours, color: '#f59e0b', icon: iconClock },
        { label: 'Approuvées', value: approuvees, color: '#10b981', icon: iconCheck },
        { label: 'Aide obtenue', value: montantTotal.toLocaleString('fr') + ' FCFA', color: '#3b82f6', icon: iconDollar }
      ];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  toggleRejetForm(demandeId: string): void {
    this.showRejetFormId = this.showRejetFormId === demandeId ? null : demandeId;
    this.motifRejet = '';
  }

  confirmerRejet(demande: Demande): void {
    if (this.motifRejet.trim().length < 10) { alert('Le motif doit contenir au moins 10 caractères'); return; }
    if (!confirm(`Rejeter la demande ${demande.reference} ?`)) return;

    this.demandeService.rejeterDemande(demande.id, this.motifRejet).subscribe({
      next: () => {
        demande.statut       = 'rejetee';
        demande.motif_rejet  = this.motifRejet;
        demande.date_traitement = new Date().toISOString();
        this.showRejetFormId = null;
        this.motifRejet      = '';
        this.buildStats(this.filteredDemandes);
        this.buildUrgences(this.filteredDemandes);
        if (this.chartsReady) this.renderCharts();
        alert('✅ Demande rejetée avec succès.');
      },
      error: (err: HttpErrorResponse) => {
        alert('❌ Erreur: ' + (err.error?.detail || err.error?.error || 'Erreur serveur'));
      }
    });
  }

  approuverDemande(demande: Demande): void {
    if (!confirm(`Approuver la demande ${demande.reference} ?`)) return;

    this.demandeService.approuverDemande(demande.id).subscribe({
      next: () => {
        demande.statut          = 'approuvee';
        demande.date_traitement = new Date().toISOString();
        this.buildStats(this.filteredDemandes);
        this.buildUrgences(this.filteredDemandes);
        if (this.chartsReady) this.renderCharts();
        alert('✅ Demande approuvée');
      },
      error: (err: HttpErrorResponse) => {
        alert('❌ Erreur: ' + (err.error?.error || 'Erreur serveur'));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS & MOCK
  // ═══════════════════════════════════════════════════════════════

  getMockData(): Demande[] {
    const types   = ['financiere','alimentaire','medicale','logement','accompagnement'];
    const statuts: Array<'soumise'|'en_cours'|'approuvee'|'rejetee'> = ['soumise','en_cours','approuvee','rejetee'];
    const urgences: Array<'faible'|'normal'|'urgent'> = ['faible','normal','urgent'];
    return Array.from({ length: 24 }, (_, i) => ({
      id: String(i + 1),
      reference: `REF-${1000 + i}`,
      beneficiaire: i + 1,
      beneficiaire_nom: `Nom${i}`,
      beneficiaire_prenom: `Prénom${i}`,
      type_aide: types[i % types.length],
      montant_demande: Math.round(50000 + Math.random() * 200000),
      motif: 'Aide urgente',
      urgence: urgences[i % urgences.length],
      statut: statuts[i % statuts.length],
      owner: 1,
      date_soumission: new Date(2026, i % 12, (i % 28) + 1).toISOString().split('T')[0],
      motif_rejet: '',
      date_traitement: null,
      agent_assigne: null,
      notes_internes: ''
    }));
  }

  typeAideLabel(v: string): string {
    return ({ financiere: 'Financière', alimentaire: 'Alimentaire', medicale: 'Médicale', logement: 'Logement', accompagnement: 'Accompagnement' } as any)[v] || v;
  }
  urgenceLabel(v: string): string { return ({ urgent: 'Urgent', normal: 'Normal', faible: 'Faible' } as any)[v] || v; }
  statutLabel(v: string): string  { return ({ soumise: 'Soumise', en_cours: 'En cours', approuvee: 'Approuvée', rejetee: 'Rejetée' } as any)[v] || v; }
}

const iconDoc    = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const iconClock  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const iconCheck  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
const iconDollar = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const iconChart  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;