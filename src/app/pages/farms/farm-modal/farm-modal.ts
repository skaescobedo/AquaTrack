import { Component, Output, EventEmitter, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { LucideAngularModule, X, Plus, Trash2 } from 'lucide-angular';
import { FarmCreate } from '../../../models/farm.model';
import { haToM2 } from '../../../utils/units';

type TabType = 'basic' | 'advanced';

@Component({
  selector: 'app-farm-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './farm-modal.html',
  styleUrls: ['./farm-modal.scss']
})
export class FarmModal implements OnDestroy {
  readonly X = X;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FarmCreate>();

  activeTab = signal<TabType>('basic');
  farmForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.farmForm = this.fb.group({
      nombre: ['', [Validators.required]],
      ubicacion: [''],
      descripcion: [''],
      superficie_ha: [null, [Validators.required, Validators.min(0.01)]],
      is_active: [true],
      estanques: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Limpiar form al abrir modal
    this.resetForm();
  }

  resetForm(): void {
    this.farmForm.reset({
      nombre: '',
      ubicacion: '',
      descripcion: '',
      superficie_ha: null,
      is_active: true
    });
    
    // Limpiar FormArray
    while (this.estanques.length > 0) {
      this.estanques.removeAt(0);
    }
    
    this.activeTab.set('basic');
  }

  get estanques(): FormArray<FormGroup> {
    return this.farmForm.get('estanques') as FormArray<FormGroup>;
  }

  get nombre() {
    return this.farmForm.get('nombre');
  }

  get ubicacion() {
    return this.farmForm.get('ubicacion');
  }

  get descripcion() {
    return this.farmForm.get('descripcion');
  }

  get superficie_ha() {
    return this.farmForm.get('superficie_ha');
  }

  get isFormValid(): boolean {
    return !!(this.nombre?.valid && this.superficie_ha?.valid);
  }

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  addEstanque(): void {
    const estanqueGroup = this.fb.group({
      nombre: [''], // Sin validación required - se filtrará en submit
      superficie_m2: [null]
    });
    this.estanques.push(estanqueGroup);
  }

  removeEstanque(index: number): void {
    this.estanques.removeAt(index);
  }

  onClose(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    // Limpiar el FormArray al destruir el componente
    while (this.estanques.length) {
      this.estanques.removeAt(0);
    }
  }

  onSubmit(): void {
    console.log('🔍 Form completo:', this.farmForm.value);
    console.log('📊 Estanques array:', this.estanques.value);
    
    // Filtrar estanques vacíos ANTES de validar
    const estanquesValidos = this.estanques.controls.filter(control => {
      const value = control.value;
      return value.nombre && value.nombre.trim() !== '';
    });

    console.log('✅ Estanques válidos filtrados:', estanquesValidos.map(c => c.value));

    // Validar solo los campos básicos (ignorar estanques para validación del form)
    const basicFieldsValid = this.nombre?.valid && this.superficie_ha?.valid;

    if (!basicFieldsValid) {
      console.log('❌ Formulario inválido');
      this.markFormGroupTouched(this.farmForm);
      return;
    }

    const formValue = this.farmForm.value;

    // Convertir hectáreas a m² para el backend
    const farmData: FarmCreate = {
      nombre: formValue.nombre,
      ubicacion: formValue.ubicacion || undefined,
      descripcion: formValue.descripcion || undefined,
      superficie_total_m2: haToM2(formValue.superficie_ha),
      estanques: estanquesValidos.length > 0 
        ? estanquesValidos.map(c => c.value)
        : undefined
    };

    console.log('🚀 Emitiendo datos:', farmData);
    this.save.emit(farmData);
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.farmForm.controls).forEach(key => {
      const control = this.farmForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}