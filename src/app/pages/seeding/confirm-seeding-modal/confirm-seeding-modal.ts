import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CheckCircle, X, AlertCircle } from 'lucide-angular';
import { SeedingService } from '../../../services/seeding';

@Component({
  selector: 'app-confirm-seeding-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './confirm-seeding-modal.html',
  styleUrl: './confirm-seeding-modal.scss'
})
export class ConfirmSeedingModal {
  readonly CheckCircle = CheckCircle;
  readonly X = X;
  readonly AlertCircle = AlertCircle;

  @Input({ required: true }) seedingId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private seedingService: SeedingService) {}

  onConfirm(): void {
    this.loading.set(true);
    this.error.set(null);

    this.seedingService.confirmSeeding(this.seedingId).subscribe({
      next: () => {
        this.confirmed.emit();
      },
      error: (err) => {
        console.error('Error confirming seeding:', err);
        this.error.set(err.error?.detail || 'Error al confirmar la siembra');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}