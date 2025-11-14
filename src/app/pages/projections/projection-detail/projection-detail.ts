import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProjectionService } from '../../../services/projections';
import { ProjectionDetail as ProjectionDetailModel, ProjectionLine } from '../../../models/projection.model';
import { 
  ApexAxisChartSeries, 
  ApexChart, 
  ApexXAxis, 
  ApexYAxis, 
  ApexDataLabels, 
  ApexStroke, 
  ApexGrid,
  ApexTooltip,
  ApexMarkers,
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  colors: string[];
  legend?: ApexLegend;
};

@Component({
  selector: 'app-projection-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgApexchartsModule],
  templateUrl: './projection-detail.html',
  styleUrl: './projection-detail.scss'
})
export class ProjectionDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;

  projection = signal<ProjectionDetailModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Opciones de gráficos
  sobOptions = signal<Partial<ChartOptions> | null>(null);
  ppOptions = signal<Partial<ChartOptions> | null>(null);
  biomasaOptions = signal<Partial<ChartOptions> | null>(null);
  densidadOptions = signal<Partial<ChartOptions> | null>(null);

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
        this.setupCharts(data.lineas);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar proyección');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../projections'], { relativeTo: this.route });
  }

  // ========================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ========================================
  private setupCharts(lines: ProjectionLine[]): void {
    this.setupSOBChart(lines);
    this.setupPPChart(lines);
    this.setupBiomasaChart(lines);
    this.setupDensidadChart(lines);
  }

  // Gráfico 1: SOB
  private setupSOBChart(lines: ProjectionLine[]): void {
    const data = lines.map(line => ({
      x: `S${line.semana_idx}`,
      y: +line.sob_pct_linea
    }));

    // Índices con cosechas
    const indicesCosecha = lines
      .map((line, index) => line.cosecha_flag ? index : -1)
      .filter(i => i !== -1);

    this.sobOptions.set({
      series: [{ name: 'SOB %', data }],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#3b82f6'],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 5,
        colors: ['#3b82f6'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesCosecha.map(index => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: '#ef4444',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        labels: { colors: '#94a3b8' }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Supervivencia (%)',
          style: { color: '#94a3b8', fontSize: '12px' }
        },
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val ? val.toFixed(1) + '%' : '0%'
        },
        min: 0,
        max: 100
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val, opts) => {
            const index = opts?.dataPointIndex;
            if (index !== undefined && indicesCosecha.includes(index)) {
              return `${val.toFixed(2)}% 🎣 (Cosecha)`;
            }
            return val.toFixed(2) + '%';
          }
        }
      }
    });
  }

  // Gráfico 2: Peso Promedio
  private setupPPChart(lines: ProjectionLine[]): void {
    const data = lines.map(line => ({
      x: `S${line.semana_idx}`,
      y: +line.pp_g
    }));

    const indicesCosecha = lines
      .map((line, index) => line.cosecha_flag ? index : -1)
      .filter(i => i !== -1);

    this.ppOptions.set({
      series: [{ name: 'Peso Promedio (g)', data }],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#10b981'],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 5,
        colors: ['#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesCosecha.map(index => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: '#ef4444',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        labels: { colors: '#94a3b8' }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Peso Promedio (g)',
          style: { color: '#94a3b8', fontSize: '12px' }
        },
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val ? val.toFixed(1) + ' g' : '0 g'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val, opts) => {
            const index = opts?.dataPointIndex;
            if (index !== undefined && indicesCosecha.includes(index)) {
              return `${val.toFixed(2)} g 🎣 (Cosecha)`;
            }
            return val.toFixed(2) + ' g';
          }
        }
      }
    });
  }

  // Gráfico 3: Biomasa (simplificado: PP * SOB)
  private setupBiomasaChart(lines: ProjectionLine[]): void {
    const data = lines.map(line => ({
      x: `S${line.semana_idx}`,
      y: +line.pp_g * (+line.sob_pct_linea / 100)
    }));

    this.biomasaOptions.set({
      series: [{ name: 'Biomasa Relativa', data }],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#8b5cf6'],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 5,
        colors: ['#8b5cf6'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 }
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        labels: { colors: '#94a3b8' }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Biomasa Relativa',
          style: { color: '#94a3b8', fontSize: '12px' }
        },
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val ? val.toFixed(2) : '0'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => val.toFixed(2)
        }
      }
    });
  }

  // Gráfico 4: Densidad (restando retiros)
  private setupDensidadChart(lines: ProjectionLine[]): void {
    let densidadAcumulada = 100;
    const data = lines.map(line => {
      const retiro = line.retiro_org_m2 ? +line.retiro_org_m2 : 0;
      if (retiro > 0) {
        densidadAcumulada -= retiro;
      }
      return {
        x: `S${line.semana_idx}`,
        y: densidadAcumulada
      };
    });

    const indicesCosecha = lines
      .map((line, index) => line.cosecha_flag ? index : -1)
      .filter(i => i !== -1);

    this.densidadOptions.set({
      series: [{ name: 'Densidad (org/m²)', data }],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#06b6d4'],
      stroke: { curve: 'stepline', width: 3 },
      markers: {
        size: 5,
        colors: ['#06b6d4'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesCosecha.map(index => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: '#ef4444',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        labels: { colors: '#94a3b8' }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Densidad (org/m²)',
          style: { color: '#94a3b8', fontSize: '12px' }
        },
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val ? val.toFixed(1) : '0'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val, opts) => {
            const index = opts?.dataPointIndex;
            if (index !== undefined && indicesCosecha.includes(index)) {
              const retiro = lines[index].retiro_org_m2;
              return `${val.toFixed(2)} org/m² 🎣 (Retiro: ${retiro})`;
            }
            return val.toFixed(2) + ' org/m²';
          }
        }
      }
    });
  }
}