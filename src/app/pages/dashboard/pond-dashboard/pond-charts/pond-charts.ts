import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PondGraficas } from '../../../../models/analytics.model';
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
  selector: 'app-pond-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pond-charts.html',
  styleUrls: ['./pond-charts.scss']
})
export class PondCharts implements OnInit {
  @Input({ required: true }) graficas!: PondGraficas;
  @Input({ required: true }) pondName!: string;

  crecimientoOptions = signal<Partial<ChartOptions> | null>(null);
  biomasaOptions = signal<Partial<ChartOptions> | null>(null);
  densidadOptions = signal<Partial<ChartOptions> | null>(null);
  sobOptions = signal<Partial<ChartOptions> | null>(null);

  ngOnInit(): void {
    this.setupCharts();
  }

  setupCharts(): void {
    this.setupCrecimientoChart();
    this.setupBiomasaChart();
    this.setupDensidadChart();
    this.setupSOBChart();
  }

  // ========================================
  // ✅ GRÁFICO DE CRECIMIENTO (PP)
  // ========================================
  private setupCrecimientoChart(): void {
    const datosValidos = this.graficas.crecimiento.filter(
      p => p.pp_proyectado_g != null || p.pp_real_g != null
    );

    // Serie 1: Proyección
    const serieProyectada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.pp_proyectado_g ?? null
    }));

    // Serie 2: Real (solo puntos donde hay biometría)
    const serieReal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.pp_real_g ?? null
    }));

    // Índices donde hay datos reales
    const indicesConBiometrias = datosValidos
      .map((p, index) => p.pp_real_g != null ? index : -1)
      .filter(i => i !== -1);

    this.crecimientoOptions.set({
      series: [
        {
          name: 'Proyectado',
          data: serieProyectada
        },
        {
          name: 'Real (Biometrías)',
          data: serieReal
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#8b5cf6', '#10b981'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 0],
        colors: ['#8b5cf6', '#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConBiometrias.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#10b981',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0,
        labels: {
          colors: '#94a3b8',
          useSeriesColors: false
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5
        }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { 
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          } 
        },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Peso Promedio (g)',
          style: {
            color: '#94a3b8',
            fontSize: '12px'
          }
        },
        labels: {
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          },
          formatter: (val) => {
            if (val == null || isNaN(val)) return '0g';
            return val.toFixed(1) + 'g';
          }
        }
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => {
            if (val == null || isNaN(val)) return 'N/A';
            return val.toFixed(2) + 'g';
          }
        }
      }
    });
  }

  // ========================================
  // ✅ GRÁFICO DE BIOMASA
  // ========================================
  private setupBiomasaChart(): void {
    const datosValidos = this.graficas.biomasa_evolucion.filter(
      p => p.biomasa_proyectada_kg != null || p.biomasa_real_kg != null
    );

    const serieProyectada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.biomasa_proyectada_kg ?? null
    }));

    const serieReal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.biomasa_real_kg ?? null
    }));

    const indicesConBiometrias = datosValidos
      .map((p, index) => p.biomasa_real_kg != null ? index : -1)
      .filter(i => i !== -1);

    this.biomasaOptions.set({
      series: [
        {
          name: 'Proyectada',
          data: serieProyectada
        },
        {
          name: 'Real (Biometrías)',
          data: serieReal
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#8b5cf6', '#10b981'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 0],
        colors: ['#8b5cf6', '#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConBiometrias.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#10b981',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0,
        labels: {
          colors: '#94a3b8',
          useSeriesColors: false
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5
        }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { 
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          } 
        },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Biomasa (kg)',
          style: {
            color: '#94a3b8',
            fontSize: '12px'
          }
        },
        labels: {
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          },
          formatter: (val) => {
            if (val == null || isNaN(val)) return '0 kg';
            return val.toFixed(1) + ' kg';
          }
        }
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => {
            if (val == null || isNaN(val)) return 'N/A';
            return val.toFixed(2) + ' kg';
          }
        }
      }
    });
  }

  // ========================================
  // ✅ GRÁFICO DE DENSIDAD
  // ========================================
  private setupDensidadChart(): void {
    const datosValidos = this.graficas.densidad_evolucion.filter(
      p => p.densidad_proyectada_org_m2 != null || p.densidad_real_org_m2 != null
    );

    const serieProyectada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.densidad_proyectada_org_m2 ?? null
    }));

    const serieReal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.densidad_real_org_m2 ?? null
    }));

    const indicesConBiometrias = datosValidos
      .map((p, index) => p.densidad_real_org_m2 != null ? index : -1)
      .filter(i => i !== -1);

    this.densidadOptions.set({
      series: [
        {
          name: 'Proyectada',
          data: serieProyectada
        },
        {
          name: 'Real (Biometrías)',
          data: serieReal
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#8b5cf6', '#10b981'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 0],
        colors: ['#8b5cf6', '#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConBiometrias.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#10b981',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0,
        labels: {
          colors: '#94a3b8',
          useSeriesColors: false
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5
        }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { 
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          } 
        },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Densidad (org/m²)',
          style: {
            color: '#94a3b8',
            fontSize: '12px'
          }
        },
        labels: {
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          },
          formatter: (val) => {
            if (val == null || isNaN(val)) return '0 org/m²';
            return val.toFixed(2) + ' org/m²';
          }
        }
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => {
            if (val == null || isNaN(val)) return 'N/A';
            return val.toFixed(2) + ' org/m²';
          }
        }
      }
    });
  }

  // ========================================
  // ✅ GRÁFICO DE SOB
  // ========================================
  private setupSOBChart(): void {
    const datosValidos = this.graficas.sob_evolucion.filter(
      p => p.sob_proyectado_pct != null || p.sob_real_pct != null
    );

    const serieProyectada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.sob_proyectado_pct ?? null
    }));

    const serieReal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.sob_real_pct ?? null
    }));

    const indicesConBiometrias = datosValidos
      .map((p, index) => p.sob_real_pct != null ? index : -1)
      .filter(i => i !== -1);

    this.sobOptions.set({
      series: [
        {
          name: 'Proyectado',
          data: serieProyectada
        },
        {
          name: 'Real (Biometrías)',
          data: serieReal
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#8b5cf6', '#10b981'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 0],
        colors: ['#8b5cf6', '#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConBiometrias.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#10b981',
          strokeColor: '#1e293b',
          size: 8,
          shape: 'circle'
        }))
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0,
        labels: {
          colors: '#94a3b8',
          useSeriesColors: false
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5
        }
      },
      grid: {
        borderColor: '#334155',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: { 
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          } 
        },
        axisBorder: { color: '#334155' },
        axisTicks: { color: '#334155' }
      },
      yaxis: {
        title: {
          text: 'Supervivencia (%)',
          style: {
            color: '#94a3b8',
            fontSize: '12px'
          }
        },
        labels: {
          style: { 
            colors: '#94a3b8', 
            fontSize: '12px' 
          },
          formatter: (val) => {
            if (val == null || isNaN(val)) return '0%';
            return val.toFixed(1) + '%';
          }
        },
        min: 0,
        max: 100
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => {
            if (val == null || isNaN(val)) return 'N/A';
            return val.toFixed(2) + '%';
          }
        }
      }
    });
  }
}