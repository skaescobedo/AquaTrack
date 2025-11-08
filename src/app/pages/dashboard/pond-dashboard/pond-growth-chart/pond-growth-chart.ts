import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { PuntoCrecimientoPond } from '../../../../models/analytics.model';

@Component({
  selector: 'app-pond-growth-chart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pond-growth-chart.html',
  styleUrls: ['./pond-growth-chart.scss']
})
export class PondGrowthChart implements OnInit {
  @Input({ required: true }) data!: PuntoCrecimientoPond[];
  @Input({ required: true }) pondName!: string;

  readonly TrendingUp = TrendingUp;

  isEmpty = signal(false);
  maxPP = signal(0);
  chartHeight = 300;

  ngOnInit(): void {
    this.isEmpty.set(!this.data || this.data.length === 0);
    
    if (!this.isEmpty()) {
      const maxValue = Math.max(...this.data.map(d => d.pp_g));
      this.maxPP.set(maxValue);
    }
  }

  getBarHeight(pp: number): string {
    if (this.maxPP() === 0) return '0%';
    return `${(pp / this.maxPP()) * 100}%`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  }
}