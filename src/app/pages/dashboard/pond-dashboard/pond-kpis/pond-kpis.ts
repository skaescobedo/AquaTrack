import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, Users, Activity, Percent } from 'lucide-angular';
import { PondKPIs, PondDetalles } from '../../../../models/analytics.model';

@Component({
  selector: 'app-pond-kpis',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pond-kpis.html',
  styleUrls: ['./pond-kpis.scss']
})
export class PondKpis {
  @Input({ required: true }) kpis!: PondKPIs;
  @Input({ required: true }) detalles!: PondDetalles;

  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Activity = Activity;
  readonly Percent = Percent;

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('es-MX', { maximumFractionDigits: 0 });
  }

  formatSuperficie(m2: number): string {
    const ha = m2 / 10000;
    return ha.toFixed(2) + ' ha';
  }

  getSOBClass(sob: number): string {
    if (sob >= 95) return 'text-green-400';
    if (sob >= 85) return 'text-blue-400';
    if (sob >= 75) return 'text-yellow-400';
    return 'text-red-400';
  }

  getPPSourceBadge(source: string): string {
    const badges: Record<string, string> = {
      'biometria': 'badge-success',
      'proyeccion': 'badge-info',
      'plan_inicial': 'badge-neutral'
    };
    return badges[source] || 'badge-neutral';
  }

  getSOBSourceBadge(source: string): string {
    const badges: Record<string, string> = {
      'operativa_actual': 'badge-success',
      'proyeccion': 'badge-info',
      'default_inicial': 'badge-neutral'
    };
    return badges[source] || 'badge-neutral';
  }

  getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      'biometria': 'Biometría',
      'proyeccion': 'Proyección',
      'plan_inicial': 'Plan Inicial',
      'operativa_actual': 'Operativa',
      'default_inicial': 'Inicial'
    };
    return labels[source] || source;
  }
}