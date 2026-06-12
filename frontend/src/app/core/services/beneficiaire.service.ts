import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Beneficiaire {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  pays_residence: string;
  // Champs ajoutés pour detail-beneficiaire
  date_naissance?: string | null;
  nationalite?: string;
  situation_familiale?: 'celibataire' | 'marie' | 'divorce' | 'veuf' | string;
  revenus_mensuels?: number | null;
  created_at?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  notes?: string;
  actif?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BeneficiaireService {
  private apiUrl = `${environment.apiUrl}/beneficiaires/`;

  constructor(private http: HttpClient) {}

  getBeneficiaires(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Méthode manquante — récupère un bénéficiaire par son id
  getBeneficiaire(id: string): Observable<Beneficiaire> {
    return this.http.get<Beneficiaire>(`${this.apiUrl}${id}/`);
  }

  createBeneficiaire(data: Partial<Beneficiaire>): Observable<Beneficiaire> {
    return this.http.post<Beneficiaire>(this.apiUrl, data);
  }

  updateBeneficiaire(id: string, data: Partial<Beneficiaire>): Observable<Beneficiaire> {
    return this.http.patch<Beneficiaire>(`${this.apiUrl}${id}/`, data);
  }

  deleteBeneficiaire(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}