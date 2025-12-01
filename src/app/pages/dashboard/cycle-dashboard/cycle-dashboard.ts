import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Calendar, Plus } from 'lucide-angular';
import { CycleService } from '../../../services/cycles';
import { AnalyticsService } from '../../../services/analytics';
import { Cycle } from '../../../models/cycle.model';
import { CycleOverview } from '../../../models/analytics.model';
import { catchError, of } from 'rxjs';

// Componentes modulares
import { CycleMetrics } from './components/cycle-metrics/cycle-metrics';
import { CycleCharts } from './components/cycle-charts/cycle-charts';
import { UpcomingSeedings } from './components/upcoming-seedings/upcoming-seedings';
import { UpcomingHarvests } from './components/upcoming-harvests/upcoming-harvests';
import { PondDetailsTable } from './components/pond-details-table/pond-details-table';
import { CreateCycleModal } from './create-cycle-modal/create-cycle-modal';
import { ProjectionProcessingModal } from './projection-processing/projection-processing';

@Component({
  selector: 'app-cycle-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    CycleMetrics,
    CycleCharts,
    UpcomingSeedings,
    UpcomingHarvests,
    PondDetailsTable,
    CreateCycleModal,
    ProjectionProcessingModal
  ],
  templateUrl: './cycle-dashboard.html',
  styleUrls: ['./cycle-dashboard.scss']
})
export class CycleDashboard implements OnInit {
  readonly Calendar = Calendar;
  readonly Plus = Plus;

  farmId: number | null = null;
  farmName = signal<string>('');
  activeCycle = signal<Cycle | null>(null);
  overview = signal<CycleOverview | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modales
  showCreateModal = signal(false);
  showProcessingModal = signal(false);
  currentJobId = signal<string | null>(null);

  constructor(
    private cycleService: CycleService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
      
      // TODO: Obtener el nombre de la granja desde un servicio o del state
      // Por ahora usar un placeholder
      this.farmName.set('Granja El Pacífico');
      
      if (this.farmId) {
        this.loadActiveCycle();
      }
    });
  }

  loadActiveCycle(): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    this.cycleService.getActiveCycle(this.farmId).pipe(
      catchError((err) => {
        if (err.status === 404) {
          console.log('No hay ciclo activo para esta granja');
          return of(null);
        }
        console.error('Error cargando ciclo activo:', err);
        this.error.set('Error al cargar el ciclo activo');
        return of(null);
      })
    ).subscribe({
      next: (cycle) => {
        this.activeCycle.set(cycle);
        if (cycle) {
          this.loadOverview(cycle.ciclo_id);
        } else {
          this.loading.set(false);
        }
      }
    });
  }

  loadOverview(cicloId: number): void {
    this.analyticsService.getCycleOverview(cicloId).subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando overview:', err);
        this.error.set('Error al cargar las estadísticas del ciclo');
        this.loading.set(false);
      }
    });
  }

  openCreateCycleModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateCycleModal(): void {
    this.showCreateModal.set(false);
  }

  /**
   * Cuando se inicia una proyección, abrir el modal de procesamiento
   */
  onProjectionStarted(jobId: string): void {
    console.log('🚀 Proyección iniciada con job_id:', jobId);
    this.currentJobId.set(jobId);
    this.showProcessingModal.set(true);
  }

  /**
   * Cuando termina el procesamiento de proyección, recargar el ciclo
   */
  onProcessingComplete(): void {
    console.log('✅ Procesamiento completado');
    this.showProcessingModal.set(false);
    this.currentJobId.set(null);
    this.loadActiveCycle();
  }

  onCycleCreated(): void {
    this.closeCreateCycleModal();
    this.loadActiveCycle();
  }

  /**
   * Parsea fecha tipo DATE (YYYY-MM-DD) como fecha local
   * sin conversión de zona horaria
   */
  private parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    // Crear fecha en zona local sin conversión UTC
    return new Date(year, month - 1, day);
  }

  formatDate(dateString: string): string {
    const date = this.parseLocalDate(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get hasCycle(): boolean {
    return this.activeCycle() !== null;
  }

  get hasUpcomingSeedings(): boolean {
    return !!this.overview() && this.overview()!.proximas_siembras.length > 0;
  }

  get hasUpcomingHarvests(): boolean {
    return !!this.overview() && this.overview()!.proximas_cosechas.length > 0;
  }
  
  getStatusLabel(status: string): string {
  switch (status) {
    case 'a': return 'Activo';
    case 'f': return 'Finalizado';
    case 'c': return 'Cancelado';
    default:  return status;
  }
}

}