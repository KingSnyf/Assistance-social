import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DemandesComponent } from './features/demandes/demandes.component';
import { DetailDemandeComponent } from './features/demandes/detail-demande/detail-demande.component';
import { CreateDemandeComponent } from './features/demandes/create-demande/create-demande.component';
import { BeneficiairesComponent } from './features/beneficiaires/beneficiaires.component';
import { DetailBeneficiaireComponent } from './features/beneficiaires/detail-beneficiaire/detail-beneficiaire.component';
import { CreateBeneficiaireComponent } from './features/beneficiaires/create-beneficiaire/create-beneficiaire.component';
import { AgentsComponent } from './features/agents/agents.component';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // Demandes — statiques AVANT dynamiques
      { path: 'demandes',          component: DemandesComponent },
      { path: 'demandes/nouvelle', component: CreateDemandeComponent },  // ← AVANT :id
      { path: 'demandes/:id',      component: DetailDemandeComponent },  // ← APRÈS
      { path: 'mes-demandes',      component: DemandesComponent },

      // Bénéficiaires — statiques AVANT dynamiques
      { path: 'beneficiaires',          component: BeneficiairesComponent },
      { path: 'beneficiaires/nouveau',  component: CreateBeneficiaireComponent }, // ← AVANT :id
      { path: 'beneficiaires/:id',      component: DetailBeneficiaireComponent }, // ← APRÈS

      // Agents
      { path: 'agents', component: AgentsComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];