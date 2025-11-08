import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Fish, Droplets, Activity, TrendingUp } from 'lucide-angular';
import { CycleKPIs } from '../../../../../models/analytics.model';

@Component({
  selector: 'app-cycle-metrics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cycle-metrics.html',
  styleUrls: ['./cycle-metrics.scss']
})
export class CycleMetrics {
  @Input({ required: true }) kpis!: CycleKPIs;

  readonly Calendar = Calendar;
  readonly Fish = Fish;
  readonly Droplets = Droplets;
  readonly Activity = Activity;
  readonly TrendingUp = TrendingUp;
}