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

  // ✅ CORREGIDO: TrackBy function para evitar NG0955
  trackByCosechaId(index: number, cosecha: ProximaCosecha): number {
    return cosecha.cosecha_ola_id;
  }

  getTipoBadgeClass(tipo: string): string {
    return tipo === 'p' ? 'badge-warning' : 'badge-danger';
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'urgente':
        return 'badge-danger';
      case 'pendiente':
        return 'badge-warning';
      case 'futura':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }

  formatDateRange(inicio: string, fin: string): string {
    const dateInicio = new Date(inicio);
    const dateFin = new Date(fin);

    const opcionesInicio: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };

    const opcionesFin: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    return `${dateInicio.toLocaleDateString('es-MX', opcionesInicio)} - ${dateFin.toLocaleDateString('es-MX', opcionesFin)}`;
  }
}