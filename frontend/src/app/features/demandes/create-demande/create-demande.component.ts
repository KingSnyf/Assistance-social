import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
          <p class="page-subtitle">Remplissez le formulaire ci-dessous pour soumettre une demande</p>
        </div>
        <a routerLink="/demandes" class="btn-outline">← Retour à la liste</a>
      </div>

      <div class="form-card">
        <form [formGroup]="demandeForm" (ngSubmit)="onSubmit()">
          
          <!-- Section: Bénéficiaire -->
          <div class="form-section">
            <h3 class="section-title">Informations du bénéficiaire</h3>
            
            <div class="form-row">
              <div class="form-group" [class.has-error]="isFieldInvalid('beneficiaire')">
                <label class="form-label">Bénéficiaire <span class="required">*</span></label>
                <select formControlName="beneficiaire" class="form-select">
                  <option value="">Sélectionner un bénéficiaire</option>
                  <option *ngFor="let b of beneficiaires" [ngValue]="b.id">
                    {{ b.prenom }} {{ b.nom }} ({{ b.email || 'Sans email' }})
                  </option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('beneficiaire')">
                  {{ getFieldError('beneficiaire') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Détails de la demande -->
          <div class="form-section">
            <h3 class="section-title">Détails de la demande</h3>
            
            <div class="form-row two-columns">
              <div class="form-group" [class.has-error]="isFieldInvalid('type_aide')">
                <label class="form-label">Type d'aide <span class="required">*</span></label>
                <select formControlName="type_aide" class="form-select">
                  <option value="">Sélectionner un type</option>
                  <option value="financiere">💰 Aide financière</option>
                  <option value="alimentaire">🍽️ Aide alimentaire</option>
                  <option value="medicale">🏥 Assistance médicale</option>
                  <option value="logement">🏠 Aide au logement</option>
                  <option value="accompagnement">🧠 Accompagnement</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('type_aide')">
                  {{ getFieldError('type_aide') }}
                </div>
              </div>

              <div class="form-group" [class.has-error]="isFieldInvalid('urgence')">
                <label class="form-label">Niveau d'urgence <span class="required">*</span></label>
                <select formControlName="urgence" class="form-select">
                  <option value="faible">🟢 Faible</option>
                  <option value="normal" selected>🟠 Normal</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('urgence')">
                  {{ getFieldError('urgence') }}
                </div>
              </div>
            </div>

            <div class="form-row two-columns">
              <div class="form-group" [class.has-error]="isFieldInvalid('montant_demande')">
                <label class="form-label">Montant demandé (USD) <span class="required">*</span></label>
                <input 
                  type="number" 
                  formControlName="montant_demande" 
                  class="form-input" 
                  placeholder="Ex: 500"
                  min="10"
                  max="10000"
                  step="10"
                >
                <div class="error-message" *ngIf="isFieldInvalid('montant_demande')">
                  {{ getFieldError('montant_demande') }}
                </div>
                <div class="help-text">Montant entre 10$ et 10 000$</div>
              </div>

              <div class="form-group">
                <label class="form-label">Date de soumission</label>
                <input type="text" class="form-input" [value]="today | date:'dd MMMM yyyy'" disabled>
              </div>
            </div>

            <div class="form-group" [class.has-error]="isFieldInvalid('motif')">
              <label class="form-label">Motif de la demande <span class="required">*</span></label>
              <textarea 
                formControlName="motif" 
                class="form-textarea" 
                rows="5"
                placeholder="Décrivez en détail votre situation et vos besoins..."
              ></textarea>
              <div class="error-message" *ngIf="isFieldInvalid('motif')">
                {{ getFieldError('motif') }}
              </div>
              <div class="help-text">
                {{ demandeForm.get('motif')?.value?.length || 0 }} caractères 
                <span *ngIf="demandeForm.get('urgence')?.value === 'urgent'">
                  (minimum 50 requis pour les demandes urgentes)
                </span>
              </div>
            </div>
          </div>

          <!-- Alertes -->
          <div class="alert alert-error" *ngIf="submitError">
            <span class="alert-icon">⚠️</span>
            {{ submitError }}
          </div>

          <div class="alert alert-success" *ngIf="submitSuccess">
            <span class="alert-icon">✅</span>
            {{ submitSuccess }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" routerLink="/demandes" class="btn btn-secondary">
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="demandeForm.invalid || isSubmitting"
            >
              <span *ngIf="isSubmitting" class="spinner"></span>
              <span *ngIf="!isSubmitting">Soumettre la demande</span>
              <span *ngIf="isSubmitting">Traitement en cours...</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-title { font-size: 24px; font-weight: 700; color: #2C3E50; margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: #7F8C8D; margin: 0; }
    .btn-outline { padding: 8px 16px; border: 1px solid #D0DCE5; border-radius: 6px; background: #FFFFFF; color: #5A6C7D; text-decoration: none; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-outline:hover { background: #F8FAFC; border-color: #B0C4D3; }
    
    .form-card { background: #FFFFFF; border: 1px solid #E1E8ED; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .form-section { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #F0F4F8; }
    .form-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #2C3E50; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 2px solid #E3F2FD; }
    
    .form-row { margin-bottom: 20px; }
    .form-row.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group.has-error .form-input,
    .form-group.has-error .form-select,
    .form-group.has-error .form-textarea { border-color: #E74C3C; background: #FFFBFB; }
    
    .form-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #34495E; }
    .required { color: #E74C3C; margin-left: 2px; }
    
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 11px 14px; border: 1.5px solid #D0DCE5; border-radius: 8px;
      font-size: 14px; color: #2C3E50; background: #FFFFFF; transition: all 0.2s;
      font-family: inherit;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none; border-color: #4A90E2; box-shadow: 0 0 0 3px rgba(74,144,226,0.1);
    }
    .form-input:disabled { background: #F5F7FA; color: #95A5A6; cursor: not-allowed; }
    .form-textarea { resize: vertical; min-height: 120px; }
    
    .help-text { font-size: 11px; color: #7F8C8D; margin-top: 6px; }
    .error-message { color: #E74C3C; font-size: 12px; margin-top: 6px; font-weight: 500; }
    
    .alert { padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; font-size: 14px; }
    .alert-error { background: #FFEBEE; border: 1px solid #FFCDD2; color: #C62828; }
    .alert-success { background: #E8F5E9; border: 1px solid #C8E6C9; color: #2E7D32; }
    .alert-icon { font-size: 18px; flex-shrink: 0; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 24px; border-top: 1px solid #F0F4F8; margin-top: 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-primary { background: #4A90E2; color: #FFFFFF; }
    .btn-primary:hover:not(:disabled) { background: #357ABD; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,144,226,0.3); }
    .btn-secondary { background: #FFFFFF; border: 1px solid #D0DCE5; color: #5A6C7D; }
    .btn-secondary:hover { background: #F8FAFC; border-color: #B0C4D3; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #FFFFFF; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    @media (max-width: 768px) {
      .form-row.two-columns { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; }
      .form-actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  `]
})
export class CreateDemandeComponent {
  demandeForm: FormGroup;
  beneficiaires: Beneficiaire[] = [];
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';
  today = new Date();

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
      urgence: ['normal', Validators.required],
      motif: ['', [Validators.required, Validators.minLength(20)]]
    });

    // Validation dynamique pour les demandes urgentes
    this.demandeForm.get('urgence')?.valueChanges.subscribe(urgence => {
      const motifControl = this.demandeForm.get('motif');
      if (urgence === 'urgent') {
        motifControl?.setValidators([Validators.required, Validators.minLength(50)]);
      } else {
        motifControl?.setValidators([Validators.required, Validators.minLength(20)]);
      }
      motifControl?.updateValueAndValidity();
    });

    this.loadBeneficiaires();
  }

  loadBeneficiaires(): void {
    this.beneficiaireService.getBeneficiaires().subscribe({
      next: (data) => {
        this.beneficiaires = data.results || data;
      },
      error: (err) => {
        console.error('Erreur chargement bénéficiaires:', err);
        this.submitError = 'Impossible de charger la liste des bénéficiaires.';
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.demandeForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.demandeForm.get(fieldName);
    if (!field?.errors) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire.';
    if (field.hasError('minlength')) {
      const min = field.errors['minlength'].requiredLength;
      return `Minimum ${min} caractères requis.`;
    }
    if (field.hasError('min')) return 'Le montant minimum est de 10$.';
    if (field.hasError('max')) return 'Le montant maximum est de 10 000$.';
    
    return 'Champ invalide.';
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      this.submitError = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    const formData: CreateDemandeDto = this.demandeForm.value;

    this.demandeService.createDemande(formData).subscribe({
      next: (response) => {
        this.submitSuccess = `✅ Demande ${response.reference} créée avec succès !`;
        setTimeout(() => {
          this.router.navigate(['/demandes']);
        }, 1500);
      },
      error: (err) => {
        this.submitError = err.message || 'Erreur lors de la création de la demande.';
        this.isSubmitting = false;
      }
    });
  }
}