import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users } from 'lucide-angular';
import { PuntoDensidadPond } from '../../../../models/analytics.model';

@Component({
  selector: 'app-pond-density-chart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pond-density-chart.html',
  styleUrls: ['./pond-density-chart.scss']
})
export class PondDensityChart implements OnInit {
  @Input({ required: true }) data!: PuntoDensidadPond[];
  @Input({ required: true }) pondName!: string;

  readonly Users = Users;

  isEmpty = signal(false);
  maxDensity = signal(0);
  chartHeight = 300;

  ngOnInit(): void {
    this.isEmpty.set(!this.data || this.data.length === 0);
    
    if (!this.isEmpty()) {
      const maxValue = Math.max(...this.data.map(d => d.densidad_org_m2));
      this.maxDensity.set(maxValue);
    }
  }

  getLineHeight(density: number): string {
    if (this.maxDensity() === 0) return '50%';
    return `${((this.maxDensity() - density) / this.maxDensity()) * 100}%`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  }
}