import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, X, Calendar, AlertCircle } from 'lucide-angular';
import { HarvestService } from '../../../services/harvest';
import { HarvestWaveCreate } from '../../../models/harvest.model';

@Component({
  selector: 'app-create-wave-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './create-wave-modal.html',
  styleUrl: './create-wave-modal.scss'
})
export class CreateWaveModal {
  readonly Package = Package;
  readonly X = X;
  readonly Calendar = Calendar;
  readonly AlertCircle = AlertCircle;

  @Input({ required: true }) cycleId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  // Form values
  nombre = '';
  tipo: 'p' | 'f' = 'p';
  ventanaInicio = '';
  ventanaFin = '';
  objetivoRetiro: number | null = null;
  notas = '';

  constructor(private harvestService: HarvestService) {}

  ngOnInit(): void {
    // Set default dates (today + 30 days)
    const today = new Date();
    const monthLater = new Date(today);
    monthLater.setDate(monthLater.getDate() + 30);

    this.ventanaInicio = this.formatDateForInput(today);
    this.ventanaFin = this.formatDateForInput(monthLater);
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const data: HarvestWaveCreate = {
      nombre: this.nombre,
      tipo: this.tipo,
      ventana_inicio: this.ventanaInicio,
      ventana_fin: this.ventanaFin,
      objetivo_retiro_org_m2: this.objetivoRetiro || undefined,
      notas: this.notas || undefined
    };

    this.harvestService.createWave(this.cycleId, data).subscribe({
      next: () => {
        this.created.emit();
      },
      error: (err) => {
        console.error('Error creating wave:', err);
        this.error.set(err.error?.detail || 'Error al crear la ola de cosecha');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  isValid(): boolean {
    return !!(
      this.nombre &&
      this.tipo &&
      this.ventanaInicio &&
      this.ventanaFin &&
      new Date(this.ventanaInicio) <= new Date(this.ventanaFin)
    );
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Getter para label del tipo
  get tipoLabel(): string {
    return this.tipo === 'p' ? 'Parcial' : 'Final';
  }
}