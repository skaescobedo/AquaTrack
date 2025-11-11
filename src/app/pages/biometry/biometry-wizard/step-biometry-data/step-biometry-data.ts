import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BiometryContext } from '../../../../models/biometry.model';

interface FormData {
  peso_muestra_g: number | null;
  n_muestra: number | null;
  sob_usada_pct: number | null;
}

@Component({
  selector: 'app-step-biometry-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-biometry-data.html',
  styleUrl: './step-biometry-data.scss'
})
export class StepBiometryData {
  @Input() context: BiometryContext | null = null;
  @Input() formData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  localData: FormData = {
    peso_muestra_g: null,
    n_muestra: null,
    sob_usada_pct: null
  };

  ngOnInit(): void {
    if (this.formData) {
      this.localData = {
        peso_muestra_g: this.formData.peso_muestra_g,
        n_muestra: this.formData.n_muestra,
        sob_usada_pct: this.formData.sob_usada_pct
      };
    }
  }

  onFieldChange(field: keyof FormData, value: string): void {
    const numValue = value ? parseFloat(value) : null;
    console.log(`📝 Campo cambiado: ${field} = ${numValue} (input: "${value}")`);
    this.localData[field] = numValue;
    this.dataChange.emit({ [field]: numValue });
  }

  onCheckboxChange(checked: boolean): void {
    console.log(`☑️ Checkbox actualiza_sob_operativa: ${checked}`);
    this.dataChange.emit({ 
      actualiza_sob_operativa: checked,
      sob_fuente: checked ? 'operativa_actual' : null
    });
  }

  get calculatedPP(): number | null {
    const { peso_muestra_g, n_muestra } = this.localData;
    if (peso_muestra_g && n_muestra && n_muestra > 0) {
      return peso_muestra_g / n_muestra;
    }
    return null;
  }
}