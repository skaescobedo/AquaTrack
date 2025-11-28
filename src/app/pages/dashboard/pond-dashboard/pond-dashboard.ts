import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Waves } from 'lucide-angular';
import { AnalyticsService } from '../../../services/analytics';
import { PondDetail } from '../../../models/analytics.model';
import { catchError, of } from 'rxjs';

// Componentes hijos
import { PondKpis } from './pond-kpis/pond-kpis';
import { PondCharts } from './pond-charts/pond-charts';

@Component({
  selector: 'app-pond-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PondKpis,
    PondCharts
  ],
  templateUrl: './pond-dashboard.html',
  styleUrls: ['./pond-dashboard.scss']
})
export class PondDashboard implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Waves = Waves;

  pondId = signal<number | null>(null);
  cycleId = signal<number | null>(null);
  farmId = signal<number | null>(null);
  detail = signal<PondDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la ruta
    this.route.params.subscribe(params => {
      this.pondId.set(+params['pondId']);
      this.loadPondDetail();
    });

    // Obtener farmId y cycleId de los parámetros del padre
    this.route.parent?.params.subscribe(params => {
      this.farmId.set(+params['farmId']);
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['ciclo_id']) {
        this.cycleId.set(+queryParams['ciclo_id']);
        this.loadPondDetail();
      }
    });
  }

  private loadPondDetail(): void {
    const pondId = this.pondId();
    const cycleId = this.cycleId();

    if (!pondId || !cycleId) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getPondDetail(pondId, cycleId)
      .pipe(
        catchError(err => {
          console.error('Error loading pond detail:', err);
          this.error.set(err.error?.detail || 'Error al cargar los datos del estanque');
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          this.detail.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  goBack(): void {
    const farmId = this.farmId();
    if (farmId) {
      this.router.navigate(['/farms', farmId, 'ponds']);
    }
  }

  get statusLabel(): string {
    const status = this.detail()?.status;
    const labels: Record<string, string> = {
      'i': 'Inactivo',
      'a': 'Operativo',
      'c': 'En Cosecha',
      'm': 'Mantenimiento'
    };
    return status ? labels[status] || status : '';
  }

  get statusClass(): string {
    const status = this.detail()?.status;
    const classes: Record<string, string> = {
      'i': 'badge-neutral',
      'a': 'badge-success',
      'c': 'badge-warning',
      'm': 'badge-info'
    };
    return status ? classes[status] || 'badge-neutral' : 'badge-neutral';
  }
}