import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { BiometryList } from '../../../models/biometry.model';
import { Pond } from '../../../models/pond.model';

interface BiometryWithPondInfo extends BiometryList {
  estanque_nombre: string;
}

@Component({
  selector: 'app-biometry-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './biometry-table.html',
  styleUrl: './biometry-table.scss'
})
export class BiometryTable {
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;

  @Input({ required: true }) biometries: BiometryList[] = [];
  @Input({ required: true }) ponds: Pond[] = [];
  @Input() loading = false;

  getPondName(estanqueId: number): string {
    const pond = this.ponds.find(p => p.estanque_id === estanqueId);
    return pond?.nombre || 'Desconocido';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatNumber(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(decimals);
  }

  getIncrementClass(increment: number | null): string {
    if (!increment) return '';
    return increment >= 0 ? 'increment-positive' : 'increment-negative';
  }

  getIncrementIcon(increment: number | null) {
    if (!increment) return null;
    return increment >= 0 ? this.TrendingUp : this.TrendingDown;
  }
}