import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Upload } from 'lucide-angular';
import { CycleService } from '../../../../services/cycles';

@Component({
  selector: 'app-create-cycle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './create-cycle-modal.html',
  styleUrls: ['./create-cycle-modal.scss']
})
export class CreateCycleModal {
  @Input({ required: true }) farmId!: number;
  @Input({ required: true }) farmName!: string;
  @Input() show = false;
  @Output() showChange = new EventEmitter<boolean>();
  @Output() cycleCreated = new EventEmitter<void>();
  @Output() projectionStarted = new EventEmitter<string>();

  readonly X = X;
  readonly Upload = Upload;

  cycleForm: FormGroup;
  selectedFile = signal<File | null>(null);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private cycleService: CycleService
  ) {
    this.cycleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin_planificada: [''],
      descripcion_proyeccion: ['']
    });
  }

  close(): void {
    if (!this.isSubmitting()) {
      this.show = false;
      this.showChange.emit(false);
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-excel', // xls
        'text/csv',
        'application/pdf'
      ];
      
      if (!validTypes.includes(file.type)) {
        this.error.set('Tipo de archivo no válido. Use Excel, CSV o PDF.');
        this.selectedFile.set(null);
        input.value = '';
        return;
      }

      this.selectedFile.set(file);
      this.error.set(null);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    const fileInput = document.getElementById('projectionFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.cycleForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      const formData = new FormData();
      const formValues = this.cycleForm.value;

      formData.append('nombre', formValues.nombre);
      formData.append('fecha_inicio', formValues.fecha_inicio);
      
      if (formValues.fecha_fin_planificada) {
        formData.append('fecha_fin_planificada', formValues.fecha_fin_planificada);
      }

      const file = this.selectedFile();
      if (file) {
        formData.append('file', file);
        if (formValues.descripcion_proyeccion) {
          formData.append('descripcion_proyeccion', formValues.descripcion_proyeccion);
        }
      }

      const response = await this.cycleService.createCycleWithFile(this.farmId, formData).toPromise();
      
      // Si hay job_id, emitir evento de proyección iniciada
      if (response?.job_id) {
        this.projectionStarted.emit(response.job_id);
      }
      
      this.cycleCreated.emit();
      this.close();
    } catch (err: any) {
      this.error.set(err.error?.detail || 'Error al crear el ciclo');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.cycleForm.reset();
    this.selectedFile.set(null);
    this.error.set(null);
    
    const fileInput = document.getElementById('projectionFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}