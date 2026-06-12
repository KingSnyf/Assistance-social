import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Gestion des Agents</h1>
      <p>Page en cours de développement.</p>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #166534; }
  `]
})
export class AgentsComponent {}