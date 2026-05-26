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
    <div class="page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="header-left">
          <a routerLink="/mes-demandes" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retour
          </a>
          <h1>Nouvelle demande d'aide</h1>
          <p>Remplissez le formulaire — tous les champs marqués <span class="req">*</span> sont obligatoires</p>
        </div>

        <!-- Steps indicator -->
        <div class="steps-row">
          <div class="step" [class.active]="true" [class.done]="currentStep > 1">
            <div class="step-num">1</div>
            <span>Bénéficiaire</span>
          </div>
          <div class="step-line"></div>
          <div class="step" [class.active]="currentStep >= 2" [class.done]="currentStep > 2">
            <div class="step-num">2</div>
            <span>Aide & Montant</span>
          </div>
          <div class="step-line"></div>
          <div class="step" [class.active]="currentStep >= 3">
            <div class="step-num">3</div>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <!-- FORM CARD -->
      <div class="form-card">
        <form [formGroup]="demandeForm" (ngSubmit)="onSubmit()" novalidate>

          <!-- SECTION 1: Bénéficiaire & Urgence -->
          <div class="form-section" [class.section-active]="currentStep === 1">
            <div class="section-title">
              <div class="section-num">1</div>
              <h2>Identification du bénéficiaire</h2>
            </div>

            <div class="field-grid two-col">
              <div class="field-group" [class.invalid]="isInvalid('beneficiaire')">
                <label>Bénéficiaire <span class="req">*</span></label>
                <div class="select-wrapper">
                  <select formControlName="beneficiaire">
                    <option value="">— Sélectionner un bénéficiaire —</option>
                    <option *ngFor="let b of beneficiaires" [value]="b.id">
                      {{ b.prenom }} {{ b.nom }} {{ b.pays_residence ? '(' + b.pays_residence + ')' : '' }}
                    </option>
                  </select>
                  <div class="loading-option" *ngIf="loadingBenef">
                    <div class="mini-spinner"></div> Chargement…
                  </div>
                </div>
                <span class="field-err" *ngIf="isInvalid('beneficiaire')">Veuillez sélectionner un bénéficiaire</span>
              </div>

              <div class="field-group" [class.invalid]="isInvalid('urgence')">
                <label>Niveau d'urgence <span class="req">*</span></label>
                <div class="urgence-selector">
                  <label class="urgence-opt" [class.selected]="demandeForm.get('urgence')?.value === 'faible'">
                    <input type="radio" formControlName="urgence" value="faible">
                    <span class="urg-dot green"></span> Faible
                  </label>
                  <label class="urgence-opt" [class.selected]="demandeForm.get('urgence')?.value === 'normal'">
                    <input type="radio" formControlName="urgence" value="normal">
                    <span class="urg-dot orange"></span> Normal
                  </label>
                  <label class="urgence-opt" [class.selected]="demandeForm.get('urgence')?.value === 'urgent'">
                    <input type="radio" formControlName="urgence" value="urgent">
                    <span class="urg-dot red"></span> Urgent
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Type & Montant -->
          <div class="form-section" [class.section-active]="currentStep <= 2">
            <div class="section-title">
              <div class="section-num">2</div>
              <h2>Type d'aide et montant</h2>
            </div>

            <div class="field-grid two-col">
              <div class="field-group" [class.invalid]="isInvalid('type_aide')">
                <label>Type d'aide <span class="req">*</span></label>
                <div class="type-grid">
                  <label class="type-card" *ngFor="let t of typesAide"
                         [class.selected]="demandeForm.get('type_aide')?.value === t.value">
                    <input type="radio" formControlName="type_aide" [value]="t.value">
                    <span class="type-emoji">{{ t.emoji }}</span>
                    <span class="type-label">{{ t.label }}</span>
                  </label>
                </div>
                <span class="field-err" *ngIf="isInvalid('type_aide')">Veuillez choisir un type d'aide</span>
              </div>

              <div class="field-group" [class.invalid]="isInvalid('montant_demande')">
                <label>Montant demandé (USD) <span class="req">*</span></label>
                <div class="amount-field">
                  <span class="currency-prefix">$</span>
                  <input type="number" formControlName="montant_demande"
                         min="10" max="10000" step="10"
                         placeholder="0">
                </div>
                <div class="amount-hints">
                  <span>Min : 10 $</span>
                  <span>Max : 10 000 $</span>
                </div>
                <div class="field-err" *ngIf="isInvalid('montant_demande')">
                  <ng-container *ngIf="demandeForm.get('montant_demande')?.errors?.['required']">Montant requis</ng-container>
                  <ng-container *ngIf="demandeForm.get('montant_demande')?.errors?.['min']">Montant minimum : 10 $</ng-container>
                  <ng-container *ngIf="demandeForm.get('montant_demande')?.errors?.['max']">Montant maximum : 10 000 $</ng-container>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Motif -->
          <div class="form-section">
            <div class="section-title">
              <div class="section-num">3</div>
              <h2>Motif de la demande</h2>
            </div>

            <div class="field-group" [class.invalid]="isInvalid('motif')">
              <label>Description de la situation <span class="req">*</span></label>
              <textarea formControlName="motif" rows="5"
                        placeholder="Décrivez la situation du bénéficiaire, les raisons de la demande, et tout élément utile à son évaluation…"></textarea>
              <div class="char-count">
                <span class="field-err" *ngIf="isInvalid('motif')">Minimum 20 caractères requis</span>
                <span class="char-indicator" [class.ok]="(demandeForm.get('motif')?.value?.length || 0) >= 20">
                  {{ demandeForm.get('motif')?.value?.length || 0 }} / 20 min
                </span>
              </div>
            </div>
          </div>

          <!-- ALERTS -->
          <div class="alert-error" *ngIf="submitError">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ submitError }}
          </div>

          <div class="alert-success" *ngIf="submitSuccess">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ submitSuccess }}
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <a routerLink="/mes-demandes" class="btn-cancel">Annuler</a>
            <button type="submit" class="btn-submit" [disabled]="demandeForm.invalid || isSubmitting">
              <div class="mini-spinner" *ngIf="isSubmitting"></div>
              <svg *ngIf="!isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ isSubmitting ? 'Envoi en cours…' : 'Soumettre la demande' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./create-demande.component.css']
})
export class CreateDemandeComponent implements OnInit {
  demandeForm: FormGroup;
  beneficiaires: Beneficiaire[] = [];
  isSubmitting = false;
  loadingBenef = false;
  submitError = '';
  submitSuccess = '';
  currentStep = 2;

  typesAide = [
    { value: 'financiere', label: 'Financière', emoji: '💰' },
    { value: 'alimentaire', label: 'Alimentaire', emoji: '🍽️' },
    { value: 'medicale', label: 'Médicale', emoji: '🏥' },
    { value: 'logement', label: 'Logement', emoji: '🏠' },
    { value: 'accompagnement', label: 'Accompagnement', emoji: '🤝' }
  ];

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
  }

  ngOnInit(): void {
    this.loadingBenef = true;
    this.beneficiaireService.getBeneficiaires().subscribe({
      next: (data) => {
        this.beneficiaires = data.results || data;
        this.loadingBenef = false;
      },
      error: (_e: HttpErrorResponse) => {
        this.submitError = 'Impossible de charger les bénéficiaires.';
        this.loadingBenef = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const f = this.demandeForm.get(field);
    return !!(f?.invalid && (f?.touched || f?.dirty));
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      this.submitError = 'Veuillez corriger les erreurs avant de soumettre.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.demandeService.createDemande(this.demandeForm.value as CreateDemandeDto).subscribe({
      next: (res) => {
        this.submitSuccess = `Demande ${res.reference} soumise avec succès !`;
        setTimeout(() => this.router.navigate(['/mes-demandes']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        if (err.error && typeof err.error === 'object') {
          const msgs = Object.entries(err.error).map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`);
          this.submitError = msgs.join(' | ');
        } else {
          this.submitError = err.error?.detail || err.message || 'Erreur lors de la création.';
        }
        this.isSubmitting = false;
      }
    });
  }
}