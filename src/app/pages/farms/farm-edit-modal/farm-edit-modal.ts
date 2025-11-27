import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Building2, AlertCircle } from 'lucide-angular';
import { Farm, FarmUpdate } from '../../../models/farm.model';
import { FarmService } from '../../../services/farms';
import { PondService } from '../../../services/ponds';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { m2ToHa, haToM2 } from '../../../utils/units';

@Component({
  selector: 'app-farm-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmDialog],
  templateUrl: './farm-edit-modal.html',
  styleUrls: ['./farm-edit-modal.scss']
})
export class FarmEditModal implements OnInit {
  readonly X = X;
  readonly Building2 = Building2;
  readonly AlertCircle = AlertCircle;

  @Input() farm!: Farm;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Farm>();

  form!: FormGroup;
  isLoading = false;
  error: string | null = null;

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  // Suma de estanques vigentes en m²
  sumaEstanquesVigentesM2 = 0;

  constructor(
    private fb: FormBuilder,
    private farmService: FarmService,
    private pondService: PondService
  ) {}

  ngOnInit(): void {
    // Convertir m² a hectáreas para mostrar en el formulario
    this.form = this.fb.group({
      nombre: [this.farm.nombre, [Validators.required, Validators.minLength(2)]],
      ubicacion: [this.farm.ubicacion || ''],
      descripcion: [this.farm.descripcion || ''],
      superficie_ha: [
        m2ToHa(this.farm.superficie_total_m2),
        [Validators.required, Validators.min(0.01)]
      ]
    });

    // Obtener suma de estanques vigentes
    this.loadSumaEstanquesVigentes();
  }

  loadSumaEstanquesVigentes(): void {
    this.pondService.getPonds(this.farm.granja_id, true).subscribe({
      next: (ponds) => {
        this.sumaEstanquesVigentesM2 = ponds.reduce(
          (sum, pond) => sum + parseFloat(pond.superficie_m2),
          0
        );
      },
      error: (err) => {
        console.error('Error cargando estanques vigentes:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    
    // Convertir hectáreas a m² para validar
    const nuevaSuperficieM2 = haToM2(formValue.superficie_ha);

    // Validar si intenta reducir superficie por debajo de la suma de estanques vigentes
    if (nuevaSuperficieM2 < this.sumaEstanquesVigentesM2) {
      this.confirmDialogData = {
        title: 'Superficie insuficiente',
        message: `No puedes reducir la superficie a ${formValue.superficie_ha.toFixed(2)} ha (${nuevaSuperficieM2.toFixed(2)} m²) porque los estanques vigentes suman ${this.sumaEstanquesVigentesHa.toFixed(2)} ha (${this.sumaEstanquesVigentesM2.toFixed(2)} m²). Debes primero desactivar o eliminar algunos estanques.`,
        action: () => {
          this.onConfirmDialogCancel();
        }
      };
      this.showConfirmDialog = true;
      return;
    }

    // Si todo está bien, proceder con la actualización
    this.executeUpdate();
  }

  executeUpdate(): void {
    this.isLoading = true;
    this.error = null;

    const formValue = this.form.value;

    // Convertir hectáreas a m² para enviar al backend
    const payload: FarmUpdate = {
      nombre: formValue.nombre,
      ubicacion: formValue.ubicacion || undefined,
      descripcion: formValue.descripcion || undefined,
      superficie_total_m2: haToM2(formValue.superficie_ha)
    };

    this.farmService.updateFarm(this.farm.granja_id, payload).subscribe({
      next: (updated) => {
        this.saved.emit(updated);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al actualizar granja';
        this.isLoading = false;
      }
    });
  }

  onConfirmDialogConfirm(): void {
    this.showConfirmDialog = false;
    this.confirmDialogData = null;
  }

  onConfirmDialogCancel(): void {
    this.showConfirmDialog = false;
    this.confirmDialogData = null;
  }

  onClose(): void {
    this.close.emit();
  }

  // Getter para superficie de estanques vigentes en hectáreas
  get sumaEstanquesVigentesHa(): number {
    return m2ToHa(this.sumaEstanquesVigentesM2);
  }

  // Getters para acceso a controles del formulario
  get nombre() {
    return this.form.get('nombre');
  }

  get superficie_ha() {
    return this.form.get('superficie_ha');
  }
}