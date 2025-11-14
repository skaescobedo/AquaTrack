import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, TrendingUp, Plus } from 'lucide-angular';
import { forkJoin, catchError, of } from 'rxjs';

import { ProjectionService } from '../../services/projections';
import { CycleService } from '../../services/cycles';

import { ProjectionDetail, Projection } from '../../models/projection.model';
import { Cycle } from '../../models/cycle.model';

import { ProjectionCurrentCard } from './projection-current-card/projection-current-card';
import { ProjectionDraftCard } from './projection-draft-card/projection-draft-card';
import { ProjectionVersionsTable } from './projection-versions-table/projection-versions-table';

@Component({
  selector: 'app-projections',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ProjectionCurrentCard,
    ProjectionDraftCard,
    ProjectionVersionsTable
  ],
  templateUrl: './projections.html',
  styleUrl: './projections.scss'
})
export class Projections implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly Plus = Plus;

  farmId: number | null = null;
  farmName = signal<string>('');
  activeCycle = signal<Cycle | null>(null);
  currentProjection = signal<ProjectionDetail | null>(null);
  draftProjection = signal<ProjectionDetail | null>(null);
  allProjections = signal<Projection[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private projectionService: ProjectionService,
    private cycleService: CycleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Como projections ahora tiene children, necesitamos acceder al parent.parent
    // /farms/:farmId/projections (parent) -> /farms/:farmId (parent.parent)
    const farmIdParam = this.route.parent?.parent?.snapshot.params['farmId'];
    this.farmId = farmIdParam ? +farmIdParam : null;
    
    if (this.farmId) {
      this.loadData();
    } else {
      this.loading.set(false);
      this.error.set('No se pudo cargar el ID de la granja');
    }
  }

  loadData(): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    // Cargar ciclo activo directamente
    this.cycleService.getActiveCycle(this.farmId).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (cycle: Cycle | null) => {
        if (cycle) {
          this.activeCycle.set(cycle);
          this.loadProjections(cycle.ciclo_id);
        } else {
          this.loading.set(false);
        }
      },
      error: (err: any) => {
        this.error.set('Error al cargar datos');
        this.loading.set(false);
      }
    });
  }

  loadProjections(cycleId: number): void {
    forkJoin({
      current: this.projectionService.getCurrentProjection(cycleId).pipe(
        catchError(() => of(null))
      ),
      draft: this.projectionService.getDraftProjection(cycleId).pipe(
        catchError(() => of(null))
      ),
      all: this.projectionService.listByCycle(cycleId, false).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: (data: { current: ProjectionDetail | null; draft: ProjectionDetail | null; all: Projection[] }) => {
        this.currentProjection.set(data.current);
        this.draftProjection.set(data.draft);
        this.allProjections.set(data.all);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar proyecciones');
        this.loading.set(false);
      }
    });
  }

  onPublish(projectionId: number): void {
    this.projectionService.publish(projectionId).subscribe({
      next: () => {
        if (this.activeCycle()) {
          this.loadProjections(this.activeCycle()!.ciclo_id);
        }
      },
      error: (err: any) => {
        this.error.set('Error al publicar proyección');
      }
    });
  }

  onCancel(projectionId: number): void {
    this.projectionService.cancel(projectionId).subscribe({
      next: () => {
        if (this.activeCycle()) {
          this.loadProjections(this.activeCycle()!.ciclo_id);
        }
      },
      error: (err: any) => {
        this.error.set('Error al archivar proyección');
      }
    });
  }
}