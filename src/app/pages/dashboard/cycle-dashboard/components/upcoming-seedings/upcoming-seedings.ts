import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, Sprout } from 'lucide-angular';
import { ProximaSiembra } from '../../../../../models/analytics.model';

@Component({
  selector: 'app-upcoming-seedings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './upcoming-seedings.html',
  styleUrls: ['./upcoming-seedings.scss']
})
export class UpcomingSeedings {
  @Input({ required: true }) siembras!: ProximaSiembra[];

  readonly AlertTriangle = AlertTriangle;
  readonly Sprout = Sprout;
  readonly Math = Math; // Hacer Math accesible en el template

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'atrasada':
        return 'badge-danger';
      case 'proxima':
        return 'badge-warning';
      case 'programada':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  }
}