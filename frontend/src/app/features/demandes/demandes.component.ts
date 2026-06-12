import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeService, Demande } from '../../core/services/demande.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.css']
})
export class DemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading = true;
  error = '';
  role = '';
  rejetForms: { [id: string]: { open: boolean; motif: string; loading: boolean; error: string } } = {};

  constructor(
    private demandeService: DemandeService,
    private auth: AuthService
  ) {}

  get isAdminOrAgent(): boolean {
    return this.role === 'admin' || this.role === 'agent';
  }

  ngOnInit(): void {
    this.role = this.auth.getUserRole();
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.demandeService.getDemandes().subscribe({
      next: (data: any) => {
        this.demandes = data.results || data;
        this.loading = false;
        this.demandes.forEach(d => {
          if (!this.rejetForms[d.id]) {
            this.rejetForms[d.id] = { open: false, motif: '', loading: false, error: '' };
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.detail || 'Erreur lors du chargement des demandes.';
        this.loading = false;
      }
    });
  }

  approuverDemande(id: string): void {
    this.demandeService.approuverDemande(id).subscribe({
      next: () => this.loadDemandes(),
      error: (err: HttpErrorResponse) => console.error('Erreur approbation:', err)
    });
  }

  toggleRejetForm(id: string): void {
    if (this.rejetForms[id]) {
      this.rejetForms[id].open = !this.rejetForms[id].open;
    }
  }

  confirmerRejet(id: string): void {
    const form = this.rejetForms[id];
    if (!form || form.motif.trim().length < 10) {
      if (form) form.error = 'Le motif doit contenir au moins 10 caractères.';
      return;
    }
    form.loading = true;
    form.error = '';
    this.demandeService.rejeterDemande(id, form.motif).subscribe({
      next: () => {
        form.open = false;
        form.motif = '';
        form.loading = false;
        this.loadDemandes();
      },
      error: (err: HttpErrorResponse) => {
        form.error = err.error?.detail || 'Erreur lors du rejet.';
        form.loading = false;
      }
    });
  }

  prendreEnCharge(id: string): void {
    this.demandeService.prendreEnChargeDemande(id).subscribe({
      next: () => this.loadDemandes(),
      error: (err: HttpErrorResponse) => console.error('Erreur:', err)
    });
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      soumise: 'Soumise', en_cours: 'En cours', approuvee: 'Approuvée',
      rejetee: 'Rejetée', cloturee: 'Clôturée'
    };
    return labels[statut] || statut;
  }
}