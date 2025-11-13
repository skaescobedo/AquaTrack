import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CycleGraficas } from '../../../../../models/analytics.model';
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
  selector: 'app-cycle-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './cycle-charts.html',
  styleUrls: ['./cycle-charts.scss']
})
export class CycleCharts implements OnInit {
  @Input({ required: true }) graficas!: CycleGraficas;

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
    // Filtrar datos válidos
    const datosValidos = this.graficas.crecimiento.filter(
      p => p.pp_proyectado_original_g != null || p.pp_ajustado_g != null
    );

    // Preparar datos para serie 1: Proyección Original
    const serieOriginal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.pp_proyectado_original_g ?? null
    }));

    // Preparar datos para serie 2: Proyección Ajustada
    const serieAjustada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.pp_ajustado_g ?? null
    }));

    // Identificar índices donde hay biometrías reales
    const indicesConBiometrias = datosValidos
      .map((p, index) => p.tiene_datos_reales ? index : -1)
      .filter(i => i !== -1);

    this.crecimientoOptions.set({
      series: [
        {
          name: 'Proyección Original',
          data: serieOriginal
        },
        {
          name: 'Proyección Ajustada (Real)',
          data: serieAjustada
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#94a3b8', '#f59e0b'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 5],
        colors: ['#94a3b8', '#f59e0b'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConBiometrias.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#f59e0b',
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
        x: {
          show: true,
        },
        y: { 
          formatter: (val, opts) => {
            if (val == null || isNaN(val)) return '0 g';
            
            const dataIndex = opts?.dataPointIndex;
            const seriesIndex = opts?.seriesIndex;
            
            if (seriesIndex === 1 && dataIndex !== undefined && 
                indicesConBiometrias.includes(dataIndex)) {
              return `${val.toFixed(2)} g ⭐ (con biometría)`;
            }
            
            return val.toFixed(2) + ' g';
          }
        }
      }
    });
  }

  // ========================================
  // ✅ GRÁFICO DE BIOMASA - ACTUALIZADO V3
  // ========================================
  private setupBiomasaChart(): void {
    // Filtrar datos válidos
    const datosValidos = this.graficas.biomasa_evolucion.filter(
      p => p.biomasa_proyectada_original_kg != null || p.biomasa_ajustada_kg != null
    );

    // Preparar datos para serie 1: Proyección Original
    const serieOriginal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.biomasa_proyectada_original_kg ?? null
    }));

    // Preparar datos para serie 2: Proyección Ajustada
    const serieAjustada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.biomasa_ajustada_kg ?? null
    }));

    // Identificar índices donde hay datos reales (anclaje)
    const indicesConAnclaje = datosValidos
      .map((p, index) => p.tiene_datos_reales ? index : -1)
      .filter(i => i !== -1);

    this.biomasaOptions.set({
      series: [
        {
          name: 'Proyección Original',
          data: serieOriginal
        },
        {
          name: 'Proyección Ajustada (Real)',
          data: serieAjustada
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#94a3b8', '#3b82f6'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 5],
        colors: ['#94a3b8', '#3b82f6'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConAnclaje.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#3b82f6',
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
          text: 'Biomasa Total (kg)',
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
            return val.toFixed(0) + ' kg';
          }
        }
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        x: {
          show: true,
        },
        y: { 
          formatter: (val, opts) => {
            if (val == null || isNaN(val)) return '0 kg';
            
            const dataIndex = opts?.dataPointIndex;
            const seriesIndex = opts?.seriesIndex;
            
            if (seriesIndex === 1 && dataIndex !== undefined && 
                indicesConAnclaje.includes(dataIndex)) {
              return `${val.toFixed(1)} kg ⭐ (con anclaje)`;
            }
            
            return val.toFixed(1) + ' kg';
          }
        }
      }
    });
  }

  // ========================================
  // ✅ GRÁFICO DE DENSIDAD - ACTUALIZADO V3
  // ========================================
  private setupDensidadChart(): void {
    // Filtrar datos válidos
    const datosValidos = this.graficas.densidad_evolucion.filter(
      p => p.densidad_proyectada_original_org_m2 != null || p.densidad_ajustada_org_m2 != null
    );

    // Preparar datos para serie 1: Proyección Original
    const serieOriginal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.densidad_proyectada_original_org_m2 ?? null
    }));

    // Preparar datos para serie 2: Proyección Ajustada
    const serieAjustada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.densidad_ajustada_org_m2 ?? null
    }));

    // Identificar índices donde hay datos reales (anclaje)
    const indicesConAnclaje = datosValidos
      .map((p, index) => p.tiene_datos_reales ? index : -1)
      .filter(i => i !== -1);

    this.densidadOptions.set({
      series: [
        {
          name: 'Proyección Original',
          data: serieOriginal
        },
        {
          name: 'Proyección Ajustada (Real)',
          data: serieAjustada
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#94a3b8', '#10b981'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 5],
        colors: ['#94a3b8', '#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConAnclaje.map(index => ({
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
        x: {
          show: true,
        },
        y: { 
          formatter: (val, opts) => {
            if (val == null || isNaN(val)) return '0 org/m²';
            
            const dataIndex = opts?.dataPointIndex;
            const seriesIndex = opts?.seriesIndex;
            
            if (seriesIndex === 1 && dataIndex !== undefined && 
                indicesConAnclaje.includes(dataIndex)) {
              return `${val.toFixed(2)} org/m² ⭐ (con anclaje)`;
            }
            
            return val.toFixed(2) + ' org/m²';
          }
        }
      }
    });
  }

  // ========================================
  // 🆕 GRÁFICO DE SOB (NUEVO V3)
  // ========================================
  private setupSOBChart(): void {
    // Filtrar datos válidos
    const datosValidos = this.graficas.sob_evolucion.filter(
      p => p.sob_proyectado_original_pct != null || p.sob_ajustado_pct != null
    );

    // Preparar datos para serie 1: Proyección Original
    const serieOriginal = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.sob_proyectado_original_pct ?? null
    }));

    // Preparar datos para serie 2: Proyección Ajustada
    const serieAjustada = datosValidos.map(p => ({
      x: `S${p.semana}`,
      y: p.sob_ajustado_pct ?? null
    }));

    // Identificar índices donde hay datos reales (anclaje)
    const indicesConAnclaje = datosValidos
      .map((p, index) => p.tiene_datos_reales ? index : -1)
      .filter(i => i !== -1);

    this.sobOptions.set({
      series: [
        {
          name: 'Proyección Original',
          data: serieOriginal
        },
        {
          name: 'Proyección Ajustada (Real)',
          data: serieAjustada
        }
      ],
      chart: {
        type: 'line',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#94a3b8', '#8b5cf6'],
      stroke: { 
        curve: 'smooth', 
        width: [2, 3],
        dashArray: [5, 0]
      },
      markers: {
        size: [3, 5],
        colors: ['#94a3b8', '#8b5cf6'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 9 },
        discrete: indicesConAnclaje.map(index => ({
          seriesIndex: 1,
          dataPointIndex: index,
          fillColor: '#8b5cf6',
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
        x: {
          show: true,
        },
        y: { 
          formatter: (val, opts) => {
            if (val == null || isNaN(val)) return '0%';
            
            const dataIndex = opts?.dataPointIndex;
            const seriesIndex = opts?.seriesIndex;
            
            if (seriesIndex === 1 && dataIndex !== undefined && 
                indicesConAnclaje.includes(dataIndex)) {
              return `${val.toFixed(2)}% ⭐ (con anclaje)`;
            }
            
            return val.toFixed(2) + '%';
          }
        }
      }
    });
  }
}