import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Waves, Maximize2 } from 'lucide-angular';
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

  @Input({ required: true }) pond!: Pond;

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
}