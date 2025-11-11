import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BiometryContext } from '../../../../models/biometry.model';

@Component({
  selector: 'app-step-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-confirmation.html',
  styleUrl: './step-confirmation.scss'
})
export class StepConfirmation {
  @Input() context: BiometryContext | null = null;
  @Input() formData: any = null;
  @Output() notesChange = new EventEmitter<string>();

  localNotes = '';

  ngOnInit(): void {
    if (this.formData?.notas) {
      this.localNotes = this.formData.notas;
    }
  }

  onNotesChange(value: string): void {
    this.localNotes = value;
    this.notesChange.emit(value);
  }

  // ==========================================
  // CALCULATED VALUES
  // ==========================================

  get pesoPromedio(): number | null {
    const { peso_muestra_g, n_muestra } = this.formData || {};
    if (peso_muestra_g && n_muestra && n_muestra > 0) {
      return peso_muestra_g / n_muestra;
    }
    return null;
  }

  get densidadViva(): number | null {
    if (!this.context?.poblacion_estimada) return null;
    return this.context.poblacion_estimada.densidad_efectiva_org_m2;
  }

  get biomasaEstimada(): number | null {
    const pp = this.pesoPromedio;
    const orgTotal = this.context?.poblacion_estimada?.organismos_totales;
    
    if (pp && orgTotal) {
      return (pp * orgTotal) / 1000; // Convert g to kg
    }
    return null;
  }

  get kgPorHa(): number | null {
    const biomasa = this.biomasaEstimada;
    const densidad = this.densidadViva;
    
    if (biomasa && densidad) {
      // Assuming superficie in m2 from context
      // This is a simplified calculation, adjust based on actual pond area
      return biomasa * 10; // Simplified conversion
    }
    return null;
  }

  formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return '-';
    return value.toFixed(decimals);
  }
}