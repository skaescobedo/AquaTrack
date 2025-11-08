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
  ApexMarkers
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

  ngOnInit(): void {
    this.setupCharts();
  }

  setupCharts(): void {
    // Gráfico de Crecimiento (naranja)
    this.crecimientoOptions.set({
      series: [{
        name: 'Peso Promedio (g)',
        data: this.graficas.crecimiento.map(p => ({
          x: `S${p.semana}`,
          y: p.pp_proyectado_g
        }))
      }],
      chart: {
        type: 'line',
        height: 300,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#f59e0b'],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 5,
        colors: ['#f59e0b'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 7 }
      },
      dataLabels: { enabled: false },
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
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val.toFixed(1) + 'g'
        }
      },
      tooltip: {
        theme: 'dark',
        y: { formatter: (val) => val.toFixed(2) + ' g' }
      }
    });

    // Gráfico de Biomasa (azul)
    this.biomasaOptions.set({
      series: [{
        name: 'Biomasa (kg)',
        data: this.graficas.biomasa_evolucion.map(p => ({
          x: `S${p.semana}`,
          y: p.biomasa_kg
        }))
      }],
      chart: {
        type: 'area',
        height: 300,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#3b82f6'],
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 0 },
      dataLabels: { enabled: false },
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
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val.toFixed(0) + ' kg'
        }
      },
      tooltip: {
        theme: 'dark',
        y: { formatter: (val) => val.toFixed(1) + ' kg' }
      }
    });

    // Gráfico de Densidad (verde)
    this.densidadOptions.set({
      series: [{
        name: 'Densidad (org/m²)',
        data: this.graficas.densidad_evolucion.map(p => ({
          x: `S${p.semana}`,
          y: p.densidad_org_m2
        }))
      }],
      chart: {
        type: 'line',
        height: 300,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#10b981'],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 4,
        colors: ['#10b981'],
        strokeColors: '#1e293b',
        strokeWidth: 2,
        hover: { size: 6 }
      },
      dataLabels: { enabled: false },
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
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val) => val.toFixed(2) + ' org/m²'
        }
      },
      tooltip: {
        theme: 'dark',
        y: { formatter: (val) => val.toFixed(2) + ' org/m²' }
      }
    });
  }
}