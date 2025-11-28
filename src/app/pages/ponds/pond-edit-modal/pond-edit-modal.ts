// pages/ponds/pond-edit-modal/pond-edit-modal.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Waves, AlertCircle } from 'lucide-angular';
import { Pond, PondUpdate } from '../../../models/pond.model';
import { PondService } from '../../../services/ponds';

@Component({
  selector: 'app-pond-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './pond-edit-modal.html',
  styleUrls: ['./pond-edit-modal.scss']
})
export class PondEditModal implements OnInit {
  readonly X = X;
  readonly Waves = Waves;
  readonly AlertCircle = AlertCircle;

  @Input() pond!: Pond;
  @Input() farmId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Pond>();
  @Output() error = new EventEmitter<string>();

  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private pondService: PondService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [this.pond.nombre, [Validators.required, Validators.minLength(2)]],
      superficie_m2: [
        parseFloat(this.pond.superficie_m2),
        [Validators.required, Validators.min(1)]
      ],
      notas: [this.pond.notas || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload: PondUpdate = {
      nombre: this.form.value.nombre,
      superficie_m2: parseFloat(this.form.value.superficie_m2),
      notas: this.form.value.notas || undefined
    };

    this.pondService.updatePond(this.pond.estanque_id, payload).subscribe({
      next: (updated) => {
        this.saved.emit(updated);
      },
      error: (err) => {
        let errorMessage = 'Error al actualizar estanque';
        
        if (err.error?.detail) {
          if (typeof err.error.detail === 'string') {
            errorMessage = err.error.detail;
          } else if (typeof err.error.detail === 'object' && err.error.detail.message) {
            errorMessage = err.error.detail.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.emit(errorMessage);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  get nombre() {
    return this.form.get('nombre');
  }

  get superficie_m2() {
    return this.form.get('superficie_m2');
  }

  get superficieHa(): number {
    const m2 = this.form.value.superficie_m2;
    if (!m2) return 0;
    return parseFloat(m2) / 10000;
  }
}