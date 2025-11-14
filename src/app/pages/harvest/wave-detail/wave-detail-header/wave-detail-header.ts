import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, Calendar, CheckCircle, Clock, XCircle } from 'lucide-angular';
import { 
  HarvestWave, 
  getWaveTypeLabel,
  getWaveTypeBadgeClass,
  getWaveStatusLabel,
  getWaveStatusBadgeClass,
  formatDateRange,
  canCancelWave
} from '../../../../models/harvest.model';

interface WaveStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

@Component({
  selector: 'app-wave-detail-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './wave-detail-header.html',
  styleUrl: './wave-detail-header.scss'
})
export class WaveDetailHeader {
  readonly Package = Package;
  readonly Calendar = Calendar;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly XCircle = XCircle;

  @Input({ required: true }) wave!: HarvestWave;
  @Input({ required: true }) stats!: WaveStats;

  @Output() cancelWave = new EventEmitter<void>();

  // Getters
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

  get canCancel(): boolean {
    return canCancelWave(this.wave);
  }

  get completionPercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.confirmed / this.stats.total) * 100);
  }

  // Handler
  onCancelClick(): void {
    this.cancelWave.emit();
  }
}