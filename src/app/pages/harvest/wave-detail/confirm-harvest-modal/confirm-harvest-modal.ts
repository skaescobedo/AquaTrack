import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CheckCircle, X, AlertCircle, Package } from 'lucide-angular';
import { HarvestService } from '../../../../services/harvest';
import { HarvestLineWithPondInfo, HarvestConfirm } from '../../../../models/harvest.model';

type InputMode = 'biomasa' | 'densidad';

@Component({
  selector: 'app-confirm-harvest-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './confirm-harvest-modal.html',
  styleUrl: './confirm-harvest-modal.scss'
})
export class ConfirmHarvestModal {
  readonly CheckCircle = CheckCircle;
  readonly X = X;
  readonly AlertCircle = AlertCircle;
  readonly Package = Package;

  @Input({ required: true }) harvestId!: number;
  @Input({ required: true }) harvest!: HarvestLineWithPondInfo;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  // Form values
  inputMode: InputMode = 'biomasa';
  biomasa: number | null = null;
  densidad: number | null = null;
  notas = '';

  constructor(private harvestService: HarvestService) {}

  onSubmit(): void {
    const validation = this.validateForm();
    if (validation !== true) {
      this.error.set(validation);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data: HarvestConfirm = {
      biomasa_kg: this.inputMode === 'biomasa' ? this.biomasa! : undefined,
      densidad_retirada_org_m2: this.inputMode === 'densidad' ? this.densidad! : undefined,
      notas: this.notas || undefined
    };

    this.harvestService.confirmHarvest(this.harvestId, data).subscribe({
      next: () => {
        this.confirmed.emit();
      },
      error: (err) => {
        console.error('Error confirming harvest:', err);
        this.error.set(err.error?.detail || 'Error al confirmar la cosecha');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  validateForm(): true | string {
    if (this.inputMode === 'biomasa') {
      if (!this.biomasa || this.biomasa <= 0) {
        return 'La biomasa debe ser mayor a 0';
      }
    } else {
      if (!this.densidad || this.densidad <= 0) {
        return 'La densidad debe ser mayor a 0';
      }
    }
    return true;
  }

  get isValid(): boolean {
    return this.validateForm() === true;
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Cambiar modo de input
  onInputModeChange(): void {
    // Reset values cuando cambia el modo
    this.biomasa = null;
    this.densidad = null;
    this.error.set(null);
  }
}