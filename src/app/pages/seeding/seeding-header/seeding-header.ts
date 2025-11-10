import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, TrendingUp } from 'lucide-angular';
import { SeedingPlanWithItems } from '../../../models/seeding.model';

@Component({
  selector: 'app-seeding-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './seeding-header.html',
  styleUrl: './seeding-header.scss'
})
export class SeedingHeader {
  readonly Calendar = Calendar;
  readonly TrendingUp = TrendingUp;

  @Input({ required: true }) plan!: SeedingPlanWithItems;

  // Computed: Conteo de siembras confirmadas
  confirmedCount = computed(() => {
    return this.plan.siembras.filter(s => s.status === 'f').length;
  });

  // Computed: Total de siembras
  totalCount = computed(() => {
    return this.plan.siembras.length;
  });

  // Computed: Porcentaje completado
  completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.confirmedCount() / total) * 100);
  });

  // Computed: Estado de la ventana (abierta/cerrada)
  windowStatus = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inicio = new Date(this.plan.ventana_inicio);
    const fin = new Date(this.plan.ventana_fin);

    if (today < inicio) {
      return 'futura';
    } else if (today > fin) {
      return 'cerrada';
    } else {
      return 'abierta';
    }
  });

  // Helpers
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusText(): string {
    const status = this.plan.status;
    const statusMap: Record<string, string> = {
      'p': 'Planeado',
      'e': 'En Ejecución',
      'f': 'Finalizado'
    };
    return statusMap[status] || 'Desconocido';
  }

  getStatusClass(): string {
    const status = this.plan.status;
    const classMap: Record<string, string> = {
      'p': 'status-planned',
      'e': 'status-active',
      'f': 'status-completed'
    };
    return classMap[status] || '';
  }

  getWindowStatusText(): string {
    const status = this.windowStatus();
    const statusMap: Record<string, string> = {
      'futura': 'Próxima',
      'abierta': 'Abierta',
      'cerrada': 'Cerrada'
    };
    return statusMap[status] || '';
  }

  getWindowStatusClass(): string {
    const status = this.windowStatus();
    const classMap: Record<string, string> = {
      'futura': 'window-future',
      'abierta': 'window-open',
      'cerrada': 'window-closed'
    };
    return classMap[status] || '';
  }
}