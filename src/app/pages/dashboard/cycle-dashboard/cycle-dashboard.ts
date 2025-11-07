import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Calendar, Plus, TrendingUp, Fish, Droplets, Activity } from 'lucide-angular';
import { CycleService } from '../../../services/cycles';
import { AnalyticsService } from '../../../services/analytics';
import { Cycle } from '../../../models/cycle.model';
import { CycleOverview } from '../../../models/analytics.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-cycle-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cycle-dashboard.html',
  styleUrls: ['./cycle-dashboard.scss']
})
export class CycleDashboard implements OnInit {
  readonly Calendar = Calendar;
  readonly Plus = Plus;
  readonly TrendingUp = TrendingUp;
  readonly Fish = Fish;
  readonly Droplets = Droplets;
  readonly Activity = Activity;

  farmId: number | null = null;
  activeCycle = signal<Cycle | null>(null);
  overview = signal<CycleOverview | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showCreateModal = signal(false);

  constructor(
    private cycleService: CycleService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
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
        // Si es 404, significa que no hay ciclo activo (no es un error)
        if (err.status === 404) {
          console.log('No hay ciclo activo para esta granja');
          return of(null);
        }
        // Otros errores sí son problemáticos
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

  onCycleCreated(): void {
    this.closeCreateCycleModal();
    this.loadActiveCycle();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get hasCycle(): boolean {
    return this.activeCycle() !== null;
  }
}