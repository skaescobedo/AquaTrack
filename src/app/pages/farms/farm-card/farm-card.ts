import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Building2, MapPin, Maximize2, Edit, MoreVertical } from 'lucide-angular';
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
  readonly Edit = Edit;
  readonly MoreVertical = MoreVertical;

  @Input({ required: true }) farm!: Farm;
  @Output() viewPanel = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Farm>();
  @Output() deactivate = new EventEmitter<number>();
  @Output() activate = new EventEmitter<number>();

  showMenu = false;

  onViewPanel(): void {
    this.viewPanel.emit(this.farm.granja_id);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.showMenu = false;
    this.edit.emit(this.farm);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onDeactivate(event: Event): void {
    event.stopPropagation();
    this.showMenu = false;
    this.deactivate.emit(this.farm.granja_id);
  }

  onActivate(event: Event): void {
    event.stopPropagation();
    this.showMenu = false;
    this.activate.emit(this.farm.granja_id);
  }

  get superficieFormatted(): string {
    return formatSuperficieHa(this.farm.superficie_total_m2);
  }
}