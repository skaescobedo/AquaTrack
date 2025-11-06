import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="layout-container">
      <header class="header">
        <h1>AquaTrack</h1>
        <!-- Aquí irá tu navbar/header -->
      </header>
      
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .header {
      background: #0066cc;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: #f5f5f5;
    }
  `]
})
export class PlaceholderComponent {}