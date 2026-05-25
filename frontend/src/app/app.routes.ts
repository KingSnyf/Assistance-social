import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  
  // ✅ Routes pour les demandes
  { path: 'demandes', loadComponent: () => import('./features/demandes/demandes.component').then(m => m.DemandesComponent), canActivate: [authGuard] },
  { path: 'mes-demandes', loadComponent: () => import('./features/demandes/demandes.component').then(m => m.DemandesComponent), canActivate: [authGuard] }, // ← AJOUTÉ
  { path: 'nouvelle-demande', loadComponent: () => import('./features/demandes/create-demande/create-demande.component').then(m => m.CreateDemandeComponent), canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/login' }
];