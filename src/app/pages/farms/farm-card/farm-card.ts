import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Building2, MapPin, Maximize2 } from 'lucide-angular';
import { Farm } from '../../../models/farm.model';
import { formatSuperficieHa } from '../../../utils/units';

@Component({
  selector: 'app-farm-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './farm-card.html',
  styleUrls: ['./farm-card.scss']
})
export class FarmCard {
  readonly Building2 = Building2;
  readonly MapPin = MapPin;
  readonly Maximize2 = Maximize2;

  @Input({ required: true }) farm!: Farm;
  @Output() viewPanel = new EventEmitter<number>();

  onViewPanel(): void {
    this.viewPanel.emit(this.farm.granja_id);
  }

  get superficieFormatted(): string {
    return formatSuperficieHa(this.farm.superficie_total_m2);
  }
}