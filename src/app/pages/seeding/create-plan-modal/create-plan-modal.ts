import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, X } from 'lucide-angular';
import { SeedingService } from '../../../services/seeding';
import { SeedingPlanCreate } from '../../../models/seeding.model';

@Component({
  selector: 'app-create-plan-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './create-plan-modal.html',
  styleUrl: './create-plan-modal.scss'
})
export class CreatePlanModal {
  readonly Calendar = Calendar;
  readonly X = X;

  @Input({ required: true }) cycleId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  // Form values
  ventanaInicio = '';
  ventanaFin = '';
  densidad = 80;
  talla = 0.8;
  observaciones = '';

  constructor(private seedingService: SeedingService) {}

  ngOnInit(): void {
    // Set default dates (today + 7 days)
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    this.ventanaInicio = this.formatDateForInput(today);
    this.ventanaFin = this.formatDateForInput(weekLater);
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const data: SeedingPlanCreate = {
      ventana_inicio: this.ventanaInicio,
      ventana_fin: this.ventanaFin,
      densidad_org_m2: this.densidad,
      talla_inicial_g: this.talla,
      observaciones: this.observaciones || undefined
    };

    this.seedingService.createPlan(this.cycleId, data).subscribe({
      next: () => {
        this.created.emit();
      },
      error: (err) => {
        console.error('Error creating plan:', err);
        this.error.set(err.error?.detail || 'Error al crear el plan de siembras');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  isValid(): boolean {
    return !!(
      this.ventanaInicio &&
      this.ventanaFin &&
      this.densidad > 0 &&
      this.talla > 0
    );
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}