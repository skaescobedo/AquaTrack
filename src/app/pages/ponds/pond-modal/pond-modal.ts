import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Waves } from 'lucide-angular';
import { PondCreate } from '../../../models/pond.model';

@Component({
  selector: 'app-pond-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './pond-modal.html',
  styleUrls: ['./pond-modal.scss']
})
export class PondModal implements OnInit {
  readonly X = X;
  readonly Waves = Waves;

  @Input({ required: true }) farmId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<PondCreate>();

  pondForm!: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.pondForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      superficie_m2: ['', [Validators.required, Validators.min(1)]],
      is_vigente: [true]
    });
  }

  onSubmit(): void {
    if (this.pondForm.invalid) {
      this.pondForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const pondData: PondCreate = {
      nombre: this.pondForm.value.nombre,
      superficie_m2: parseFloat(this.pondForm.value.superficie_m2),
      is_vigente: this.pondForm.value.is_vigente
    };

    this.save.emit(pondData);
  }

  onClose(): void {
    this.close.emit();
  }

  get superficieHa(): number {
    const m2 = this.pondForm.value.superficie_m2;
    if (!m2) return 0;
    return parseFloat(m2) / 10000;
  }
}