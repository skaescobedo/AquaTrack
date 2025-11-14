import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, Calendar, CheckCircle, Clock } from 'lucide-angular';
import { HarvestWave } from '../../../models/harvest.model';
import { Cycle } from '../../../models/cycle.model';

@Component({
  selector: 'app-harvest-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './harvest-header.html',
  styleUrl: './harvest-header.scss'
})
export class HarvestHeader {
  readonly Package = Package;
  readonly Calendar = Calendar;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;

  @Input({ required: true }) cycle!: Cycle;
  @Input({ required: true }) waves!: HarvestWave[];

  // Computed: Estadísticas de olas
  totalWaves = computed(() => this.waves.length);
  
  activeWaves = computed(() => 
    this.waves.filter(w => w.status === 'p' || w.status === 'r').length
  );
  
  cancelledWaves = computed(() => 
    this.waves.filter(w => w.status === 'x').length
  );

  // Status del ciclo
  get cycleStatus(): string {
    return this.cycle.status === 'activo' ? 'Activo' : 
           this.cycle.status === 'finalizado' ? 'Finalizado' : 'Cancelado';
  }

  get cycleStatusClass(): string {
    return this.cycle.status === 'activo' ? 'status-active' : 
           this.cycle.status === 'finalizado' ? 'status-completed' : 'status-cancelled';
  }

  // Formato de fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}