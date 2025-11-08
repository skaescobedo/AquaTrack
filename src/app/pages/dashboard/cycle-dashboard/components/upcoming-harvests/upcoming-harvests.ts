import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, Calendar } from 'lucide-angular';
import { ProximaCosecha } from '../../../../../models/analytics.model';

@Component({
  selector: 'app-upcoming-harvests',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './upcoming-harvests.html',
  styleUrls: ['./upcoming-harvests.scss']
})
export class UpcomingHarvests {
  @Input({ required: true }) cosechas!: ProximaCosecha[];

  readonly Package = Package;
  readonly Calendar = Calendar;

  /**
   * Parsea fecha tipo DATE (YYYY-MM-DD) como fecha local
   * sin conversión de zona horaria
   */
  private parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    // Crear fecha en zona local sin conversión UTC
    return new Date(year, month - 1, day);
  }

  formatDateRange(inicio: string, fin: string): string {
    const dateInicio = this.parseLocalDate(inicio);
    const dateFin = this.parseLocalDate(fin);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
      });
    };

    return `${formatDate(dateInicio)} - ${formatDate(dateFin)}`;
  }

  getTipoBadgeClass(tipo: string): string {
    return tipo === 'Final' ? 'badge-warning' : 'badge-info';
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'badge-success';
      case 'en_progreso':
        return 'badge-warning';
      case 'pendiente':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }
}