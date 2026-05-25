import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeService, CreateDemandeDto } from '../../../core/services/demande.service';
import { BeneficiaireService, Beneficiaire } from '../../../core/services/beneficiaire.service';

@Component({
  selector: 'app-create-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Nouvelle demande d'aide</h1>
          <p class="page-subtitle">Remplissez le formulaire ci-dessous</p>
        </div>
        <a routerLink="/demandes" class="btn-outline">← Retour</a>
      </div>

      <div class="form-card">
        <form [formGroup]="demandeForm" (ngSubmit)="onSubmit()">
          <div class="form-row two-columns">
            <div class="form-group">
              <label class="form-label">Bénéficiaire <span class="req">*</span></label>
              <select formControlName="beneficiaire" class="form-select" [class.invalid]="isInvalid('beneficiaire')">
                <option value="">Sélectionner</option>
                <option *ngFor="let b of beneficiaires" [ngValue]="b.id">{{ b.prenom }} {{ b.nom }}</option>
              </select>
              <div class="error" *ngIf="isInvalid('beneficiaire')">Champ requis</div>
            </div>
            <div class="form-group">
              <label class="form-label">Type d'aide <span class="req">*</span></label>
              <select formControlName="type_aide" class="form-select" [class.invalid]="isInvalid('type_aide')">
                <option value="">Sélectionner</option>
                <option value="financiere">Financière</option>
                <option value="alimentaire">Alimentaire</option>
                <option value="medicale">Médicale</option>
                <option value="logement">Logement</option>
              </select>
              <div class="error" *ngIf="isInvalid('type_aide')">Champ requis</div>
            </div>
          </div>

          <div class="form-row two-columns">
            <div class="form-group">
              <label class="form-label">Montant (USD) <span class="req">*</span></label>
              <input type="number" formControlName="montant_demande" class="form-input" min="10" max="10000" [class.invalid]="isInvalid('montant_demande')">
              <div class="error" *ngIf="isInvalid('montant_demande')">Entre 10$ et 10 000$</div>
            </div>
            <div class="form-group">
              <label class="form-label">Urgence</label>
              <select formControlName="urgence" class="form-select">
                <option value="faible">Faible</option>
                <option value="normal" selected>Normale</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Motif <span class="req">*</span></label>
            <textarea formControlName="motif" class="form-textarea" rows="4" [class.invalid]="isInvalid('motif')"></textarea>
            <div class="error" *ngIf="isInvalid('motif')">Minimum 20 caractères</div>
          </div>

          <div class="alert alert-error" *ngIf="submitError">{{ submitError }}</div>
          <div class="alert alert-success" *ngIf="submitSuccess">{{ submitSuccess }}</div>

          <div class="form-actions">
            <button type="button" routerLink="/demandes" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary" [disabled]="demandeForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Traitement...' : 'Soumettre' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #0F172A; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748B; margin-top: 4px; }
    .btn-outline { padding: 8px 16px; border: 1px solid #E2E8F0; border-radius: 6px; background: white; color: #475569; text-decoration: none; font-size: 13px; }
    .form-card { background: white; border: 1px solid #E1E8ED; border-radius: 12px; padding: 32px; }
    .form-row { display: flex; gap: 20px; margin-bottom: 20px; }
    .form-row.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 0; }
    .form-group { flex: 1; margin-bottom: 20px; }
    .form-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155; }
    .req { color: #EF4444; }
    .form-input, .form-select, .form-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 14px; background: #F8FAFC; transition: 0.2s; font-family: inherit; }
    .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #2563EB; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .form-select.invalid, .form-input.invalid, .form-textarea.invalid { border-color: #EF4444; background: #FEF2F2; }
    .error { color: #EF4444; font-size: 12px; margin-top: 6px; }
    .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .alert-error { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
    .alert-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #F0F4F8; }
    .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
    .btn-primary { background: #2563EB; color: white; }
    .btn-primary:hover:not(:disabled) { background: #1D4ED8; }
    .btn-secondary { background: white; border: 1px solid #E2E8F0; color: #475569; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    @media(max-width: 640px) { .form-row.two-columns { grid-template-columns: 1fr; } .form-actions { flex-direction: column; } .btn { width: 100%; } }
  `]
})
export class CreateDemandeComponent implements OnInit {
  demandeForm: FormGroup;
  beneficiaires: Beneficiaire[] = [];
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private beneficiaireService: BeneficiaireService,
    private router: Router
  ) {
    this.demandeForm = this.fb.group({
      beneficiaire: ['', Validators.required],
      type_aide: ['', Validators.required],
      montant_demande: ['', [Validators.required, Validators.min(10), Validators.max(10000)]],
      urgence: ['normal'],
      motif: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    this.beneficiaireService.getBeneficiaires().subscribe({
      next: (data) => this.beneficiaires = data.results || data,
      // ✅ TYPE STRICT
      error: (error: HttpErrorResponse) => this.submitError = 'Impossible de charger les bénéficiaires.'
    });
  }

  isInvalid(field: string): boolean {
    const f = this.demandeForm.get(field);
    return !!(f?.invalid && (f?.touched || f?.dirty));
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      this.submitError = 'Veuillez corriger les erreurs.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.demandeService.createDemande(this.demandeForm.value as CreateDemandeDto).subscribe({
      next: (res) => {
        this.submitSuccess = `✅ Demande ${res.reference} créée !`;
        setTimeout(() => this.router.navigate(['/demandes']), 1200);
      },
      // ✅ TYPE STRICT
      error: (error: HttpErrorResponse) => {
        this.submitError = error.error?.detail || error.message || 'Erreur lors de la création.';
        this.isSubmitting = false;
      }
    });
  }
}