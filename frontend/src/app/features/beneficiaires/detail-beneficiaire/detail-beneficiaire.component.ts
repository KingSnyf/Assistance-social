import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BeneficiaireService, Beneficiaire } from '../../../core/services/beneficiaire.service';

@Component({
  selector: 'app-detail-beneficiaire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">

      <!-- HEADER -->
      <div class="page-header">
        <button class="btn-back" routerLink="/beneficiaires">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour
        </button>
        <div class="header-center" *ngIf="beneficiaire">
          <div class="avatar-lg" [style.background]="avatarColor()">{{ initiales() }}</div>
          <div>
            <h1>{{ beneficiaire.prenom }} {{ beneficiaire.nom }}</h1>
            <p class="page-sub">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {{ beneficiaire.pays_residence || '—' }}
            </p>
          </div>
        </div>
        <div class="header-actions" *ngIf="beneficiaire && !editMode">
          <button class="btn-edit" (click)="startEdit()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modifier
          </button>
          <button class="btn-delete" (click)="confirmDelete = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement…</span>
      </div>

      <!-- ERREUR -->
      <div class="alert-error" *ngIf="error && !loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        </svg>
        {{ error }}
      </div>

      <!-- CONTENU -->
      <div class="content-grid" *ngIf="beneficiaire && !loading">

        <!-- FICHE (lecture) -->
        <ng-container *ngIf="!editMode">

          <div class="section-card">
            <h2 class="section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Informations personnelles
            </h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Prénom</span>
                <span class="info-value">{{ beneficiaire.prenom }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nom</span>
                <span class="info-value">{{ beneficiaire.nom }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date de naissance</span>
                <span class="info-value">{{ beneficiaire.date_naissance ? (beneficiaire.date_naissance | date:'dd MMMM yyyy') : '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nationalité</span>
                <span class="info-value">{{ beneficiaire.nationalite || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Pays de résidence</span>
                <span class="info-value">{{ beneficiaire.pays_residence || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Situation familiale</span>
                <span class="info-value">{{ beneficiaire.situation_familiale || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h2 class="section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact & finances
            </h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ beneficiaire.email || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{ beneficiaire.telephone || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Revenus mensuels</span>
                <span class="info-value" *ngIf="beneficiaire.revenus_mensuels">
                  {{ beneficiaire.revenus_mensuels | number:'1.0-0' }} FCFA
                </span>
                <span class="info-value" *ngIf="!beneficiaire.revenus_mensuels">—</span>
              </div>
              <div class="info-item">
                <span class="info-label">Créé le</span>
                <span class="info-value">{{ beneficiaire.created_at ? (beneficiaire.created_at | date:'dd MMM yyyy') : '—' }}</span>
              </div>
            </div>
          </div>

        </ng-container>

        <!-- FORMULAIRE EDITION -->
        <ng-container *ngIf="editMode">
          <div class="section-card edit-card">
            <h2 class="section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifier le profil
            </h2>

            <div class="form-grid">
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="form.prenom" placeholder="Prénom" />
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="form.nom" placeholder="Nom" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" placeholder="email@exemple.com" />
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="form.telephone" placeholder="+237 6XX XXX XXX" />
              </div>
              <div class="form-group">
                <label>Date de naissance</label>
                <input type="date" [(ngModel)]="form.date_naissance" />
              </div>
              <div class="form-group">
                <label>Nationalité</label>
                <input type="text" [(ngModel)]="form.nationalite" placeholder="Nationalité" />
              </div>
              <div class="form-group">
                <label>Pays de résidence *</label>
                <input type="text" [(ngModel)]="form.pays_residence" placeholder="Pays" />
              </div>
              <div class="form-group">
                <label>Situation familiale</label>
                <select [(ngModel)]="form.situation_familiale">
                  <option value="">— Choisir —</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf/Veuve</option>
                </select>
              </div>
              <div class="form-group">
                <label>Revenus mensuels (FCFA)</label>
                <input type="number" [(ngModel)]="form.revenus_mensuels" placeholder="0" min="0" />
              </div>
            </div>

            <div class="alert-error" *ngIf="saveError" style="margin-top:12px">{{ saveError }}</div>

            <div class="form-actions">
              <button class="btn-cancel" (click)="cancelEdit()">Annuler</button>
              <button class="btn-save" (click)="saveEdit()" [disabled]="saving">
                <div class="mini-spinner" *ngIf="saving"></div>
                {{ saving ? 'Enregistrement…' : 'Sauvegarder' }}
              </button>
            </div>
          </div>
        </ng-container>

      </div>

      <!-- MODALE SUPPRESSION -->
      <div class="modal-backdrop" *ngIf="confirmDelete" (click)="confirmDelete = false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-icon icon-delete">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </div>
          <h3 class="modal-title">Supprimer ce bénéficiaire ?</h3>
          <p class="modal-body">Cette action est irréversible. Toutes les demandes associées seront également affectées.</p>
          <div class="modal-ref" *ngIf="beneficiaire">{{ beneficiaire.prenom }} {{ beneficiaire.nom }}</div>
          <div class="modal-actions">
            <button class="btn-modal-cancel" (click)="confirmDelete = false">Annuler</button>
            <button class="btn-modal-delete" (click)="deleteBeneficiaire()" [disabled]="deleting">
              <div class="mini-spinner" *ngIf="deleting"></div>
              {{ deleting ? '…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 900px; margin: 0 auto; padding: 32px 24px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

    /* HEADER */
    .page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
    .btn-back { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: white; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .btn-back:hover { border-color: #166534; color: #166534; }
    .header-center { display: flex; align-items: center; gap: 16px; flex: 1; }
    .avatar-lg { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: white; flex-shrink: 0; }
    h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
    .page-sub { font-size: 12px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; }
    .header-actions { display: flex; gap: 8px; margin-left: auto; }
    .btn-edit { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; background: #166534; color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .btn-edit:hover { background: #14532d; }
    .btn-delete { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; background: white; color: #dc2626; border: 1.5px solid #fecaca; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .btn-delete:hover { background: #fef2f2; }

    /* LOADING / ERREUR */
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 64px; justify-content: center; color: #94a3b8; font-size: 14px; }
    .spinner { width: 32px; height: 32px; border: 3px solid #d1fae5; border-top-color: #166534; border-radius: 50%; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .alert-error { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px; color: #b91c1c; font-size: 13px; font-weight: 500; }

    /* CARDS */
    .content-grid { display: grid; gap: 16px; }
    .section-card { background: white; border: 1px solid #e8edf3; border-radius: 14px; padding: 22px 24px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 18px; }

    /* INFO GRID */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .info-item { display: flex; flex-direction: column; gap: 3px; }
    .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }

    /* FORM */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; }
    .form-group input, .form-group select {
      padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 13px; font-family: inherit; color: #1e293b; background: #f8fafc;
      outline: none; transition: border-color 0.15s;
    }
    .form-group input:focus, .form-group select:focus { border-color: #166534; background: white; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f4f8; }
    .btn-cancel { padding: 9px 18px; border: 1.5px solid #e2e8f0; border-radius: 9px; background: white; color: #64748b; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-save { display: flex; align-items: center; gap: 8px; padding: 9px 22px; background: #166534; color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .btn-save:hover:not(:disabled) { background: #14532d; }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
    .mini-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }

    /* MODALE */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.15s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-box { background: white; border-radius: 16px; padding: 28px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); animation: slideUp 0.2s; text-align: center; }
    @keyframes slideUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .icon-delete { background: #fef2f2; color: #dc2626; }
    .modal-title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
    .modal-body { font-size: 13px; color: #64748b; margin: 0 0 12px; line-height: 1.6; }
    .modal-ref { font-family: monospace; font-size: 13px; background: #f1f5f9; color: #166534; padding: 4px 12px; border-radius: 6px; display: inline-block; margin-bottom: 20px; font-weight: 700; }
    .modal-actions { display: flex; gap: 10px; }
    .btn-modal-cancel { flex: 1; padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 9px; background: white; color: #64748b; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-modal-delete { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: #dc2626; color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-modal-delete:disabled { opacity: 0.6; cursor: not-allowed; }

    @media (max-width: 640px) {
      .page { padding: 16px; }
      .info-grid, .form-grid { grid-template-columns: 1fr; }
      .header-actions { width: 100%; }
    }
  `]
})
export class DetailBeneficiaireComponent implements OnInit {
  beneficiaire: Beneficiaire | null = null;
  loading  = true;
  error    = '';
  editMode = false;
  saving   = false;
  saveError = '';
  confirmDelete = false;
  deleting = false;

  form: Partial<Beneficiaire> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private beneficiaireService: BeneficiaireService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/beneficiaires']); return; }
    this.beneficiaireService.getBeneficiaire(id).subscribe({
      next: (b) => { this.beneficiaire = b; this.loading = false; },
      error: (err) => { this.error = err.message || 'Bénéficiaire introuvable.'; this.loading = false; }
    });
  }

  initiales(): string {
    if (!this.beneficiaire) return '';
    return ((this.beneficiaire.prenom[0] || '') + (this.beneficiaire.nom[0] || '')).toUpperCase();
  }

  avatarColor(): string {
    const colors = [
      'linear-gradient(135deg,#166534,#14532d)',
      'linear-gradient(135deg,#0ea5e9,#0369a1)',
      'linear-gradient(135deg,#8b5cf6,#6d28d9)',
      'linear-gradient(135deg,#f59e0b,#b45309)',
      'linear-gradient(135deg,#ec4899,#be185d)',
    ];
    if (!this.beneficiaire) return colors[0];
    const idx = (this.beneficiaire.nom.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  }

  startEdit(): void {
    if (!this.beneficiaire) return;
    this.form = { ...this.beneficiaire };
    this.editMode = true;
    this.saveError = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.saveError = '';
  }

  saveEdit(): void {
    if (!this.beneficiaire) return;
    if (!this.form.prenom?.trim() || !this.form.nom?.trim() || !this.form.pays_residence?.trim()) {
      this.saveError = 'Prénom, Nom et Pays de résidence sont obligatoires.';
      return;
    }
    this.saving = true;
    this.saveError = '';
    this.beneficiaireService.updateBeneficiaire(this.beneficiaire.id, this.form).subscribe({
      next: (updated) => {
        this.beneficiaire = updated;
        this.saving = false;
        this.editMode = false;
      },
      error: (err) => {
        this.saveError = err.message || 'Erreur lors de la sauvegarde.';
        this.saving = false;
      }
    });
  }

  deleteBeneficiaire(): void {
    if (!this.beneficiaire) return;
    this.deleting = true;
    this.beneficiaireService.deleteBeneficiaire(this.beneficiaire.id).subscribe({
      next: () => this.router.navigate(['/beneficiaires']),
      error: (err) => {
        this.error = err.message || 'Erreur lors de la suppression.';
        this.deleting = false;
        this.confirmDelete = false;
      }
    });
  }
}
