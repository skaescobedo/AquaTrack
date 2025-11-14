import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, ArrowRight, XCircle, AlertCircle } from 'lucide-angular';
import { 
  HarvestWave, 
  getWaveTypeLabel, 
  getWaveTypeBadgeClass,
  getWaveStatusLabel,
  getWaveStatusBadgeClass,
  formatDateRange,
  getWaveTemporalStatus,
  canCancelWave
} from '../../../models/harvest.model';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-wave-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './wave-card.html',
  styleUrl: './wave-card.scss'
})
export class WaveCard {
  readonly Calendar = Calendar;
  readonly ArrowRight = ArrowRight;
  readonly XCircle = XCircle;
  readonly AlertCircle = AlertCircle;

  @Input({ required: true }) wave!: HarvestWave;
  @Input() viewMode: ViewMode = 'grid';

  @Output() cardClick = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<number>();

  // Getters para helpers
  get typeLabel(): string {
    return getWaveTypeLabel(this.wave.tipo);
  }

  get typeBadgeClass(): string {
    return getWaveTypeBadgeClass(this.wave.tipo);
  }

  get statusLabel(): string {
    return getWaveStatusLabel(this.wave.status);
  }

  get statusBadgeClass(): string {
    return getWaveStatusBadgeClass(this.wave.status);
  }

  get dateRange(): string {
    return formatDateRange(this.wave.ventana_inicio, this.wave.ventana_fin);
  }

  get temporalStatus(): 'upcoming' | 'current' | 'past' | 'cancelled' {
    return getWaveTemporalStatus(this.wave);
  }

  get temporalStatusLabel(): string {
    const labels = {
      'upcoming': 'Próxima',
      'current': 'En curso',
      'past': 'Finalizada',
      'cancelled': 'Cancelada'
    };
    return labels[this.temporalStatus];
  }

  get temporalStatusClass(): string {
    const classes = {
      'upcoming': 'temporal-upcoming',
      'current': 'temporal-current',
      'past': 'temporal-past',
      'cancelled': 'temporal-cancelled'
    };
    return classes[this.temporalStatus];
  }

  get canCancel(): boolean {
    return canCancelWave(this.wave);
  }

  // Handlers
  onCardClick(): void {
    this.cardClick.emit(this.wave.cosecha_ola_id);
  }

  onCancelClick(event: Event): void {
    event.stopPropagation(); // Evitar que se dispare el click del card
    this.cancel.emit(this.wave.cosecha_ola_id);
  }

  // Formato de fecha individual
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  }
}