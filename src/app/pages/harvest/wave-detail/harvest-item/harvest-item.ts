import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, Edit2, Check, X, Package } from 'lucide-angular';
import { 
  HarvestLineWithPondInfo, 
  HarvestWave,
  HarvestReprogram,
  getHarvestLineStatusLabel,
  getHarvestLineStatusBadgeClass,
  canReprogramLine,
  canConfirmLine
} from '../../../../models/harvest.model';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-harvest-item',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './harvest-item.html',
  styleUrl: './harvest-item.scss'
})
export class HarvestItem {
  readonly Calendar = Calendar;
  readonly Edit2 = Edit2;
  readonly Check = Check;
  readonly X = X;
  readonly Package = Package;

  @Input({ required: true }) harvest!: HarvestLineWithPondInfo;
  @Input({ required: true }) wave!: HarvestWave;
  @Input() viewMode: ViewMode = 'grid';

  @Output() confirm = new EventEmitter<number>();
  @Output() reprogram = new EventEmitter<{ id: number; data: HarvestReprogram }>();

  // Edit mode state
  isEditing = signal(false);
  
  // Form values
  editDate = '';
  editMotivo = '';

  ngOnInit(): void {
    this.resetEditForm();
  }

  // Getters
  get statusLabel(): string {
    return getHarvestLineStatusLabel(this.harvest.status);
  }

  get statusBadgeClass(): string {
    return getHarvestLineStatusBadgeClass(this.harvest.status);
  }

  get isConfirmed(): boolean {
    return this.harvest.status === 'c';
  }

  get isPending(): boolean {
    return this.harvest.status === 'p';
  }

  get isCancelled(): boolean {
    return this.harvest.status === 'x';
  }

  get canEdit(): boolean {
    return canReprogramLine(this.harvest);
  }

  get canConfirm(): boolean {
    return canConfirmLine(this.harvest);
  }

  // Handlers
  startEdit(): void {
    this.resetEditForm();
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    const data: HarvestReprogram = {
      fecha_nueva: this.editDate,
      motivo: this.editMotivo || undefined
    };
    
    this.reprogram.emit({ 
      id: this.harvest.cosecha_estanque_id, 
      data 
    });
    
    this.isEditing.set(false);
  }

  onConfirmClick(): void {
    this.confirm.emit(this.harvest.cosecha_estanque_id);
  }

  // Helpers
  private resetEditForm(): void {
    this.editDate = this.harvest.fecha_cosecha || '';
    this.editMotivo = '';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusClass(): string {
    if (this.isConfirmed) return 'status-confirmed';
    if (this.isPending) return 'status-pending';
    if (this.isCancelled) return 'status-cancelled';
    return '';
  }
}