import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Shrimp, Droplets, Waves, Activity, Scale } from 'lucide-angular';
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
  readonly Shrimp = Shrimp;
  readonly Droplets = Droplets;
  readonly Waves = Waves;
  readonly Activity = Activity;
  readonly Scale = Scale;
}