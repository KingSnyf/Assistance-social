import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // ← IMPORTANT : importer RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],  // ← IMPORTANT : déclarer RouterOutlet dans imports
  template: `<router-outlet></router-outlet>`  // ← IMPORTANT : c'est ici que les pages s'affichent
})
export class AppComponent {
  title = 'SocialCare';
}