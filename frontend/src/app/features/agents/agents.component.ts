import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Gestion des agents</h1>
        <p>Consulter et gérer la liste des agents sociaux</p>
      </div>
      <button class="btn-new">+ Ajouter un agent</button>

      <div class="card">
        <h3>Aucun agent trouvé</h3>
        <p>Il n'y a pas encore d'agents enregistrés.</p>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .header { margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #64748B; }
    .btn-new { background: #2563EB; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
    .btn-new:hover { background: #1D4ED8; }
    .card { background: white; border: 1px solid #E1E8ED; border-radius: 8px; padding: 20px; text-align: center; }
    .card h3 { font-size: 16px; margin: 0 0 8px; }
    .card p { font-size: 14px; color: #64748B; margin: 0; }
  `]
})
export class AgentsComponent {}
