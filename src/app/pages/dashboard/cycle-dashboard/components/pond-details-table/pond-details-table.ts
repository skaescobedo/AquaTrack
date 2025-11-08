import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Waves, Settings, Eye, EyeOff } from 'lucide-angular';
import { EstanqueDetalle } from '../../../../../models/analytics.model';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  formatter?: (value: any) => string;
}

@Component({
  selector: 'app-pond-details-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pond-details-table.html',
  styleUrls: ['./pond-details-table.scss']
})
export class PondDetailsTable {
  @Input({ required: true }) estanques!: EstanqueDetalle[];

  readonly Waves = Waves;
  readonly Settings = Settings;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  showColumnSelector = signal(false);
  isCollapsed = signal(false);

  columns = signal<ColumnConfig[]>([
    { key: 'nombre', label: 'Estanque', visible: true },
    { key: 'superficie_m2', label: 'Superficie', visible: true, formatter: (v) => this.formatSuperficie(v) },
    { key: 'densidad_viva_org_m2', label: 'Densidad', visible: true, formatter: (v) => v.toFixed(2) + ' org/m²' },
    { key: 'sob_vigente_pct', label: 'SOB', visible: true, formatter: (v) => v.toFixed(1) + '%' },
    { key: 'pp_vigente_g', label: 'PP', visible: true, formatter: (v) => v.toFixed(2) + ' g' },
    { key: 'biomasa_est_kg', label: 'Biomasa', visible: true, formatter: (v) => v.toFixed(1) + ' kg' },
    { key: 'org_vivos_est', label: 'Org. Vivos', visible: false, formatter: (v) => this.formatNumber(v) },
  ]);

  formatSuperficie(m2: number): string {
    const hectareas = m2 / 10000;
    return hectareas.toFixed(2) + ' ha';
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  toggleColumn(columnKey: string): void {
    this.columns.update(cols => 
      cols.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  }

  toggleColumnSelector(): void {
    this.showColumnSelector.update(val => !val);
  }

  toggleCollapse(): void {
    this.isCollapsed.update(val => !val);
  }

  get visibleColumns(): ColumnConfig[] {
    return this.columns().filter(col => col.visible);
  }

  getCellValue(estanque: EstanqueDetalle, column: ColumnConfig): string {
    const value = (estanque as any)[column.key];
    return column.formatter ? column.formatter(value) : value;
  }

  getSOBClass(sob: number): string {
    if (sob >= 95) return 'sob-excellent';
    if (sob >= 85) return 'sob-good';
    if (sob >= 75) return 'sob-fair';
    return 'sob-poor';
  }
}