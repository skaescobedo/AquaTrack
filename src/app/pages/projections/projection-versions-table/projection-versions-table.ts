import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { Projection, PROJECTION_STATUS_LABELS, PROJECTION_STATUS_COLORS } from '../../../models/projection.model';

@Component({
  selector: 'app-projection-versions-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './projection-versions-table.html',
  styleUrl: './projection-versions-table.scss'
})
export class ProjectionVersionsTable {
  readonly TrendingUp = TrendingUp;

  @Input({ required: true }) projections: Projection[] = [];

  readonly statusLabels = PROJECTION_STATUS_LABELS;
  readonly statusColors = PROJECTION_STATUS_COLORS;

  getStatusClass(status: Projection['status']): string {
    const colorMap = {
      'b': 'badge-neutral',
      'p': 'badge-success',
      'r': 'badge-info',
      'x': 'badge-danger'
    };
    return `badge ${colorMap[status]}`;
  }
}