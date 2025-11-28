// pages/ponds/pond-card/pond-card.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Waves, Maximize2, MoreVertical, Edit, Trash2 } from 'lucide-angular';
import { Pond, getPondStatusLabel, getPondStatusClass } from '../../../models/pond.model';

@Component({
  selector: 'app-pond-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pond-card.html',
  styleUrls: ['./pond-card.scss']
})
export class PondCard {
  readonly Waves = Waves;
  readonly Maximize2 = Maximize2;
  readonly MoreVertical = MoreVertical;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  @Input({ required: true }) pond!: Pond;
  @Input({ required: true }) farmId!: number;
  @Input() cycleId: number | null = null;

  @Output() edit = new EventEmitter<Pond>();
  @Output() delete = new EventEmitter<Pond>();

  showMenu = signal(false);

  constructor(private router: Router) {}

  get superficieHa(): string {
    const ha = parseFloat(this.pond.superficie_m2) / 10000;
    return ha.toFixed(2);
  }

  get superficieM2Formatted(): string {
    const m2 = parseFloat(this.pond.superficie_m2);
    return m2.toLocaleString('es-MX', { maximumFractionDigits: 0 });
  }

  get statusLabel(): string {
    return getPondStatusLabel(this.pond.status);
  }

  get statusClass(): string {
    return getPondStatusClass(this.pond.status);
  }

  get vigenteClass(): string {
    return this.pond.is_vigente ? 'vigente' : 'no-vigente';
  }

  get canViewDashboard(): boolean {
    return this.pond.is_vigente && this.cycleId !== null;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.update(val => !val);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.showMenu.set(false);
    this.edit.emit(this.pond);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.showMenu.set(false);
    this.delete.emit(this.pond);
  }

  viewDashboard(): void {
    if (!this.canViewDashboard) {
      console.warn('No se puede ver el dashboard: estanque no vigente o sin ciclo activo');
      return;
    }

    this.router.navigate(
      ['/farms', this.farmId, 'ponds', this.pond.estanque_id, 'dashboard'],
      { queryParams: { ciclo_id: this.cycleId } }
    );
  }
}