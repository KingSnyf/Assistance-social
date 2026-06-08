import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BeneficiaireService } from '../../../core/services/beneficiaire.service';

@Component({
  selector: 'app-create-beneficiaire',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1>Créer un bénéficiaire</h1>
          <p class="page-sub">Remplissez les informations du nouveau bénéficiaire</p>
        </div>
        <button class="btn-secondary" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour
        </button>
      </div>

      <!-- ERREUR GLOBALE -->
      <div class="alert-error" *ngIf="error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <!-- SUCCÈS -->
      <div class="alert-success" *ngIf="success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ success }}
      </div>

      <!-- FORMULAIRE -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">

        <!-- SECTION : IDENTITÉ -->
        <div class="form-section">
          <h2>Identité</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="prenom">Prénom *</label>
              <input
                id="prenom"
                type="text"
                formControlName="prenom"
                placeholder="Jean"
                class="form-input"
                [class.error]="isFieldInvalid('prenom')"
              >
              <span class="error-text" *ngIf="isFieldInvalid('prenom')">
                Le prénom est requis
              </span>
            </div>

            <div class="form-group">
              <label for="nom">Nom *</label>
              <input
                id="nom"
                type="text"
                formControlName="nom"
                placeholder="Dupont"
                class="form-input"
                [class.error]="isFieldInvalid('nom')"
              >
              <span class="error-text" *ngIf="isFieldInvalid('nom')">
                Le nom est requis
              </span>
            </div>

            <div class="form-group">
              <label for="date_naissance">Date de naissance</label>
              <input
                id="date_naissance"
                type="date"
                formControlName="date_naissance"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="nationalite">Nationalité</label>
              <input
                id="nationalite"
                type="text"
                formControlName="nationalite"
                placeholder="Française"
                class="form-input"
              >
            </div>
          </div>
        </div>

        <!-- SECTION : CONTACT -->
        <div class="form-section">
          <h2>Contact</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="jean.dupont@example.com"
                class="form-input"
                [class.error]="isFieldInvalid('email')"
              >
              <span class="error-text" *ngIf="isFieldInvalid('email')">
                Veuillez entrer un email valide
              </span>
            </div>

            <div class="form-group">
              <label for="telephone">Téléphone</label>
              <input
                id="telephone"
                type="tel"
                formControlName="telephone"
                placeholder="+33 6 12 34 56 78"
                class="form-input"
              >
            </div>
          </div>
        </div>

        <!-- SECTION : LOCALISATION -->
        <div class="form-section">
          <h2>Localisation</h2>
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="pays_residence">Pays de résidence *</label>
              <input
                id="pays_residence"
                type="text"
                formControlName="pays_residence"
                placeholder="France"
                class="form-input"
                [class.error]="isFieldInvalid('pays_residence')"
              >
              <span class="error-text" *ngIf="isFieldInvalid('pays_residence')">
                Le pays est requis
              </span>
            </div>

            <div class="form-group">
              <label for="situation_familiale">Situation familiale</label>
              <select formControlName="situation_familiale" class="form-input">
                <option value="">-- Sélectionner --</option>
                <option value="celibataire">Célibataire</option>
                <option value="marie">Marié(e)</option>
                <option value="divorce">Divorcé(e)</option>
                <option value="veuf_veuve">Veuf/Veuve</option>
                <option value="pacs">Pacsé(e)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION : SITUATION FINANCIÈRE -->
        <div class="form-section">
          <h2>Situation financière</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="revenus_mensuels">Revenus mensuels (USD)</label>
              <input
                id="revenus_mensuels"
                type="number"
                formControlName="revenus_mensuels"
                placeholder="0"
                class="form-input"
                min="0"
                step="0.01"
              >
            </div>
          </div>
        </div>

        <!-- BOUTONS D'ACTION -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="loading || !form.valid">
            <span *ngIf="loading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="spinner">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
              Création en cours...
            </span>
            <span *ngIf="!loading">Créer le bénéficiaire</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* ── HEADER ── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 12px;
      flex-wrap: wrap;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .page-sub {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }

    /* ── ALERTES ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #7f1d1d;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .alert-error svg {
      flex-shrink: 0;
    }

    .alert-success {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      color: #166534;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .alert-success svg {
      flex-shrink: 0;
    }

    /* ── FORMULAIRE ── */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .form-section {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      background: #fafbfc;
    }

    .form-section h2 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .form-input {
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      background: white;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: #1e3a5f;
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.08);
    }

    .form-input.error {
      border-color: #fca5a5;
      background: #fff5f5;
    }

    .form-input::placeholder {
      color: #cbd5e1;
    }

    .error-text {
      font-size: 12px;
      color: #dc2626;
    }

    /* ── BOUTONS ── */
    .btn-primary,
    .btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #1e3a5f;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0f2a47;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .page {
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class CreateBeneficiaireComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private beneficiaireService: BeneficiaireService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  private initForm(): void {
    this.form = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telephone: [''],
      date_naissance: [''],
      nationalite: [''],
      pays_residence: ['', Validators.required],
      situation_familiale: [''],
      revenus_mensuels: ['', [Validators.min(0)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submit(): void {
    if (!this.form.valid) {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Nettoyer les champs vides
    const formData = { ...this.form.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    this.beneficiaireService.createBeneficiaire(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = `Bénéficiaire "${response.prenom} ${response.nom}" créé avec succès !`;
        setTimeout(() => {
          this.router.navigate(['/beneficiaires']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Erreur création bénéficiaire:', err);
        if (err.error?.email) {
          this.error = err.error.email[0];
        } else if (err.error?.detail) {
          this.error = err.error.detail;
        } else if (typeof err.error === 'object') {
          // Afficher les erreurs de validation du serveur
          const errors = Object.values(err.error).flat().join(' ');
          this.error = errors || 'Erreur lors de la création du bénéficiaire.';
        } else {
          this.error = 'Erreur lors de la création du bénéficiaire.';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/beneficiaires']);
  }
}
