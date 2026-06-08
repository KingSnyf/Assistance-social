import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'demandes',
        loadComponent: () => import('./features/demandes/demandes.component').then(m => m.DemandesComponent)
      },
      {
        path: 'demandes/:id',
        loadComponent: () => import('./features/demandes/detail-demande/detail-demande.component').then(m => m.DetailDemandeComponent)
      },
      {
        path: 'mes-demandes',
        loadComponent: () => import('./features/demandes/demandes.component').then(m => m.DemandesComponent)
      },
      {
        path: 'mes-demandes/:id',
        loadComponent: () => import('./features/demandes/detail-demande/detail-demande.component').then(m => m.DetailDemandeComponent)
      },
      {
        path: 'nouvelle-demande',
        loadComponent: () => import('./features/demandes/create-demande/create-demande.component').then(m => m.CreateDemandeComponent)
      },
      {
        path: 'beneficiaires',
        loadComponent: () => import('./features/beneficiaires/beneficiaires.component').then(m => m.BeneficiairesComponent)
      },
      {
        path: 'beneficiaires/creer',
        loadComponent: () => import('./features/beneficiaires/create-beneficiaire/create-beneficiaire.component').then(m => m.CreateBeneficiaireComponent)
      },
      {
        path: 'agents',
        loadComponent: () => import('./features/agents/agents.component').then(m => m.AgentsComponent)
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];