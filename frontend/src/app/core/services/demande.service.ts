import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Demande {
  id: string;
  reference: string;
  beneficiaire: number;
  beneficiaire_nom?: string;
  beneficiaire_prenom?: string;
  type_aide: string;
  montant_demande: number;
  motif: string;
  urgence: 'faible' | 'normal' | 'urgent';
  statut: 'soumise' | 'en_cours' | 'approuvee' | 'rejetee';
  owner: number;
  agent_assigne?: number | null;
  date_soumission: string;
  date_traitement?: string | null;
}

export interface CreateDemandeDto {
  beneficiaire: number;
  type_aide: string;
  montant_demande: number;
  motif: string;
  urgence: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.error('Session expirée. Redirection vers login...');
      // L'interceptor gère déjà la déconnexion, mais on peut logger ici
    }
    if (error.status === 403) {
      return throwError(() => new Error('Accès refusé. Vous n\'avez pas les permissions requises.'));
    }
    if (error.error?.detail || error.error?.non_field_errors) {
      const msg = typeof error.error.detail === 'string' 
        ? error.error.detail 
        : Object.values(error.error).flat().join(', ');
      return throwError(() => new Error(msg));
    }
    return throwError(() => new Error('Erreur serveur. Veuillez réessayer.'));
  }

  getDemandes(params?: { statut?: string; page?: number }): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  getDemande(id: string): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/${id}/`).pipe(catchError(this.handleError));
  }

  createDemande(data: CreateDemandeDto): Observable<Demande> {
    return this.http.post<Demande>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  updateDemande(id: string, data: Partial<Demande>): Observable<Demande> {
    return this.http.patch<Demande>(`${this.apiUrl}/${id}/`, data).pipe(catchError(this.handleError));
  }

  deleteDemande(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(catchError(this.handleError));
  }

  approuverDemande(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/approuver/`, {}).pipe(catchError(this.handleError));
  }

  rejeterDemande(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/rejeter/`, {}).pipe(catchError(this.handleError));
  }
}