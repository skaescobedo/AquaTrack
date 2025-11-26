import { Component, EventEmitter, Input, Output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-angular';
import { CycleService, JobStatus } from '../../../../services/cycles';
import { interval, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-projection-processing-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './projection-processing.html',
  styleUrls: ['./projection-processing.scss']
})
export class ProjectionProcessingModal implements OnDestroy {
  @Input({ required: true }) jobId!: string;
  @Input() show = false;
  @Output() showChange = new EventEmitter<boolean>();
  @Output() processingComplete = new EventEmitter<void>();

  readonly Loader2 = Loader2;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly AlertCircle = AlertCircle;

  jobStatus = signal<JobStatus | null>(null);
  currentStatus = signal<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  error = signal<string | null>(null);
  warnings = signal<string[] | null>(null);

  private pollingSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cycleService: CycleService) {}

  ngOnInit(): void {
    if (this.jobId) {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(): void {
    // Polling cada 2 segundos
    this.pollingSubscription = interval(2000)
      .pipe(
        switchMap(() => this.cycleService.getJobStatus(this.jobId)),
        takeWhile(
          (status) => status.status === 'pending' || status.status === 'processing',
          true // Incluir el último valor cuando cambie de estado
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (status) => {
          this.jobStatus.set(status);
          this.currentStatus.set(status.status);

          if (status.status === 'completed') {
            this.warnings.set(status.warnings || null);
            this.stopPolling();
            // Esperar 1.5 segundos antes de cerrar y emitir evento
            setTimeout(() => {
              this.processingComplete.emit();
              this.close();
            }, 1500);
          } else if (status.status === 'failed') {
            this.error.set(status.error_detail || 'Error desconocido');
            this.stopPolling();
          }
        },
        error: (err) => {
          this.error.set('Error al consultar el estado del procesamiento');
          this.currentStatus.set('failed');
          this.stopPolling();
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  close(): void {
    // Solo permitir cerrar si está completado o falló
    if (this.currentStatus() === 'completed' || this.currentStatus() === 'failed') {
      this.show = false;
      this.showChange.emit(false);
      this.stopPolling();
    }
  }

  getStatusLabel(): string {
    switch (this.currentStatus()) {
      case 'pending':
        return 'En cola...';
      case 'processing':
        return 'Procesando con IA...';
      case 'completed':
        return '¡Proyección completada!';
      case 'failed':
        return 'Error en el procesamiento';
      default:
        return 'Desconocido';
    }
  }

  getStatusDescription(): string {
    switch (this.currentStatus()) {
      case 'pending':
        return 'Tu solicitud está en cola. Esto puede tomar unos segundos.';
      case 'processing':
        return 'Estamos analizando tu archivo y creando la proyección. Por favor espera.';
      case 'completed':
        return 'La proyección se ha creado exitosamente con plan de siembras y olas de cosecha.';
      case 'failed':
        return this.error() || 'Ocurrió un error durante el procesamiento.';
      default:
        return '';
    }
  }
}