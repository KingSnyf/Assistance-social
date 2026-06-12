import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  role = 'citoyen';

  // Rejet inline
  showRejetFormId: string | null = null;
  motifRejet = '';
  rejetError = '';

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.loadDemandes();
  }

  get isAdminOrAgent(): boolean {
    return this.role === 'admin' || this.role === 'agent';
  }

  loadDemandes(): void {
    this.loading = true;
    this.demandeService.getDemandes().subscribe({
      next: (data: any) => {
        this.demandes = data.results || data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des demandes';
        this.loading = false;
      }
    });
  }

  approuverDemande(id: string): void {
    if (!confirm('Confirmer l\'approbation de cette demande ?')) return;
    this.demandeService.approuverDemande(id).subscribe({
      next: () => this.loadDemandes(),
      error: (err: any) => console.error('Erreur approbation:', err)
    });
  }

  toggleRejetForm(id: string): void {
    this.showRejetFormId = this.showRejetFormId === id ? null : id;
    this.motifRejet = '';
    this.rejetError = '';
  }

  confirmerRejet(demande: Demande): void {
    if (this.motifRejet.trim().length < 10) {
      this.rejetError = 'Le motif doit contenir au moins 10 caractères.';
      return;
    }
    this.demandeService.rejeterDemande(demande.id, this.motifRejet).subscribe({
      next: () => {
        this.showRejetFormId = null;
        this.motifRejet = '';
        this.rejetError = '';
        this.loadDemandes();
      },
      error: (err: any) => {
        this.rejetError = err.error?.detail || err.error?.error || 'Erreur lors du rejet.';
      }
    });
  }

  prendreEnCharge(id: string): void {
    this.demandeService.prendreEnChargeDemande(id).subscribe({
      next: () => this.loadDemandes(),
      error: (err: any) => console.error('Erreur prise en charge:', err)
    });
  }
}