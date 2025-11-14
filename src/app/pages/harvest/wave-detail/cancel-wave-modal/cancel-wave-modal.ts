import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, XCircle, X, AlertTriangle } from 'lucide-angular';
import { HarvestService } from '../../../../services/harvest';
import { HarvestWave } from '../../../../models/harvest.model';

@Component({
  selector: 'app-cancel-wave-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cancel-wave-modal.html',
  styleUrl: './cancel-wave-modal.scss'
})
export class CancelWaveModal {
  readonly XCircle = XCircle;
  readonly X = X;
  readonly AlertTriangle = AlertTriangle;

  @Input({ required: true }) wave!: HarvestWave;
  @Input({ required: true }) pendingCount!: number;
  @Output() close = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private harvestService: HarvestService) {}

  onConfirm(): void {
    this.loading.set(true);
    this.error.set(null);

    this.harvestService.cancelWave(this.wave.cosecha_ola_id).subscribe({
      next: () => {
        this.cancelled.emit();
      },
      error: (err) => {
        console.error('Error cancelling wave:', err);
        this.error.set(err.error?.detail || 'Error al cancelar la ola');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}