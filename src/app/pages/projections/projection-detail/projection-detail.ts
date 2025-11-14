import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, TrendingUp, Activity, Droplets } from 'lucide-angular';
import { ProjectionService } from '../../../services/projections';
import { ProjectionDetail as ProjectionDetailModel, ProjectionLine } from '../../../models/projection.model';

@Component({
  selector: 'app-projection-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './projection-detail.html',
  styleUrl: './projection-detail.scss'
})
export class ProjectionDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly TrendingUp = TrendingUp;
  readonly Activity = Activity;
  readonly Droplets = Droplets;

  projection = signal<ProjectionDetailModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Datos para gráficos computados
  chartData = computed(() => {
    const proj = this.projection();
    if (!proj) return null;

    return {
      sob: this.calculateSOBData(proj.lineas),
      pp: this.calculatePPData(proj.lineas),
      biomasa: this.calculateBiomassData(proj.lineas),
      densidad: this.calculateDensityData(proj.lineas)
    };
  });

  constructor(
    private projectionService: ProjectionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const projectionId = this.route.snapshot.params['projectionId'];
    if (projectionId) {
      this.loadProjection(+projectionId);
    }
  }

  loadProjection(id: number): void {
    this.loading.set(true);
    this.projectionService.getById(id).subscribe({
      next: (data) => {
        this.projection.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar proyección');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  // Cálculos para gráficos
  private calculateSOBData(lines: ProjectionLine[]): { week: number; sob: number; fecha: string }[] {
    return lines.map(line => ({
      week: line.semana_idx,
      sob: +line.sob_pct_linea,
      fecha: line.fecha_plan
    }));
  }

  private calculatePPData(lines: ProjectionLine[]): { week: number; pp: number; fecha: string }[] {
    return lines.map(line => ({
      week: line.semana_idx,
      pp: +line.pp_g,
      fecha: line.fecha_plan
    }));
  }

  private calculateBiomassData(lines: ProjectionLine[]): { week: number; biomasa: number; fecha: string }[] {
    // Biomasa simplificada = PP * SOB (proporcional)
    return lines.map(line => ({
      week: line.semana_idx,
      biomasa: +line.pp_g * (+line.sob_pct_linea / 100),
      fecha: line.fecha_plan
    }));
  }

  private calculateDensityData(lines: ProjectionLine[]): { week: number; densidad: number; retiro: number | null; fecha: string }[] {
    let densidadAcumulada = 100; // Asumimos 100% inicial
    
    return lines.map(line => {
      const retiro = line.retiro_org_m2 ? +line.retiro_org_m2 : 0;
      if (retiro > 0) {
        densidadAcumulada -= retiro;
      }
      
      return {
        week: line.semana_idx,
        densidad: densidadAcumulada,
        retiro: line.retiro_org_m2 ? +line.retiro_org_m2 : null,
        fecha: line.fecha_plan
      };
    });
  }
}