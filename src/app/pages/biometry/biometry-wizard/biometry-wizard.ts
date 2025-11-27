import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, ArrowLeft, ArrowRight, Activity } from 'lucide-angular';
import { BiometryService } from '../../../services/biometry';
import { BiometryCreate, BiometryContext } from '../../../models/biometry.model';
import { Pond } from '../../../models/pond.model';

import { StepSelectPond } from './step-select-pond/step-select-pond';
import { StepBiometryData } from './step-biometry-data/step-biometry-data';
import { StepConfirmation } from './step-confirmation/step-confirmation';

type StepType = 'select-pond' | 'data' | 'confirmation';

interface BiometryFormData {
  estanque_id: number | null;
  n_muestra: number | null;
  peso_muestra_g: number | null;
  sob_usada_pct: number | null;
  notas: string;
  actualiza_sob_operativa: boolean;
  sob_fuente: 'operativa_actual' | 'ajuste_manual' | 'reforecast' | null;
  motivo_cambio_sob: string;
}

@Component({
  selector: 'app-biometry-wizard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    StepSelectPond,
    StepBiometryData,
    StepConfirmation
  ],
  templateUrl: './biometry-wizard.html',
  styleUrl: './biometry-wizard.scss'
})
export class BiometryWizard implements OnInit {
  readonly X = X;
  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  readonly Activity = Activity;

  @Input({ required: true }) cycleId!: number;
  @Input({ required: true }) ponds: Pond[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  activeStep = signal<StepType>('select-pond');
  loading = signal(false);
  error = signal<string | null>(null);

  // Context from API
  context = signal<BiometryContext | null>(null);

  // Form data
  formData = signal<BiometryFormData>({
    estanque_id: null,
    n_muestra: null,
    peso_muestra_g: null,
    sob_usada_pct: null,
    notas: '',
    actualiza_sob_operativa: false,
    sob_fuente: null,
    motivo_cambio_sob: ''
  });

  constructor(private biometryService: BiometryService) {}

  ngOnInit(): void {
    // Resetear estado al inicializar
    console.log('BiometryWizard initialized');
    this.activeStep.set('select-pond');
    this.loading.set(false);
    this.error.set(null);
    this.context.set(null);
    this.formData.set({
      estanque_id: null,
      n_muestra: null,
      peso_muestra_g: null,
      sob_usada_pct: null,
      notas: '',
      actualiza_sob_operativa: false,
      sob_fuente: null,
      motivo_cambio_sob: ''
    });
    
    console.log('Active step:', this.activeStep());
    console.log('Ponds available:', this.ponds.length);
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  goToStep(step: StepType): void {
    this.activeStep.set(step);
    this.error.set(null);
  }

  goBack(): void {
    const current = this.activeStep();
    if (current === 'data') {
      this.goToStep('select-pond');
    } else if (current === 'confirmation') {
      this.goToStep('data');
    }
  }

  async goNext(): Promise<void> {
    const current = this.activeStep();
    
    if (current === 'select-pond') {
      await this.loadContextAndContinue();
    } else if (current === 'data') {
      this.goToStep('confirmation');
    }
  }

  // ==========================================
  // CONTEXT LOADING
  // ==========================================

  async loadContextAndContinue(): Promise<void> {
    const pondId = this.formData().estanque_id;
    if (!pondId) {
      this.error.set('Selecciona un estanque');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.biometryService.getContext(this.cycleId, pondId).subscribe({
      next: (context) => {
        this.context.set(context);
        
        // Pre-cargar SOB operativo en el formulario
        const currentData = this.formData();
        this.formData.set({
          ...currentData,
          sob_usada_pct: context.sob_operativo_actual.valor_pct
        });

        this.loading.set(false);
        this.goToStep('data');
      },
      error: (err) => {
        console.error('Error loading context:', err);
        this.error.set(err.error?.detail || 'Error al cargar contexto');
        this.loading.set(false);
      }
    });
  }

  // ==========================================
  // FORM UPDATES
  // ==========================================

  updateFormData(data: Partial<BiometryFormData>): void {
    this.formData.set({
      ...this.formData(),
      ...data
    });
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    const data = this.formData();
    const pondId = data.estanque_id;

    if (!pondId || !data.n_muestra || !data.peso_muestra_g) {
      this.error.set('Completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload: BiometryCreate = {
      n_muestra: data.n_muestra,
      peso_muestra_g: data.peso_muestra_g,
      sob_usada_pct: data.sob_usada_pct || undefined,
      notas: data.notas || undefined,
      actualiza_sob_operativa: data.actualiza_sob_operativa,
      sob_fuente: data.sob_fuente || undefined,
      motivo_cambio_sob: data.motivo_cambio_sob || undefined
    };

    this.biometryService.create(this.cycleId, pondId, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
      },
      error: (err) => {
        console.error('Error creating biometry:', err);
        this.error.set(err.error?.detail || 'Error al crear biometría');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  // ==========================================
  // STEP VALIDATION
  // ==========================================

  canGoNext(): boolean {
    const current = this.activeStep();
    const data = this.formData();

    if (current === 'select-pond') {
      return data.estanque_id !== null;
    }

    if (current === 'data') {
      return data.n_muestra !== null && 
             data.n_muestra > 0 && 
             data.peso_muestra_g !== null && 
             data.peso_muestra_g > 0;
    }

    return true;
  }

  isStepCompleted(step: StepType): boolean {
    const current = this.activeStep();
    const data = this.formData();

    if (step === 'select-pond') {
      return data.estanque_id !== null && 
             (current === 'data' || current === 'confirmation');
    }

    if (step === 'data') {
      return data.n_muestra !== null && 
             data.peso_muestra_g !== null && 
             current === 'confirmation';
    }

    return false;
  }
}