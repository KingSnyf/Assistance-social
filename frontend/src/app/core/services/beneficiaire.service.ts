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
}

@Injectable({ providedIn: 'root' })
export class BeneficiaireService {
  private apiUrl = `${environment.apiUrl}/beneficiaires`;

  constructor(private http: HttpClient) {}

  getBeneficiaires(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}