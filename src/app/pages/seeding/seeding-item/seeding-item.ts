import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, Edit2, Check, X } from 'lucide-angular';
import { SeedingWithPondInfo, SeedingPlan, SeedingReprogram } from '../../../models/seeding.model';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-seeding-item',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './seeding-item.html',
  styleUrl: './seeding-item.scss'
})
export class SeedingItem {
  readonly Calendar = Calendar;
  readonly Edit2 = Edit2;
  readonly Check = Check;
  readonly X = X;

  @Input({ required: true }) seeding!: SeedingWithPondInfo;
  @Input({ required: true }) plan!: SeedingPlan;
  @Input() viewMode: ViewMode = 'grid';

  @Output() confirm = new EventEmitter<number>();
  @Output() reprogram = new EventEmitter<{ id: number; data: SeedingReprogram }>();

  // Edit mode state
  isEditing = signal(false);
  
  // Form values
  editDate = '';
  editLote = '';
  editDensidad = 0;
  editTalla = 0;
  editMotivo = '';

  ngOnInit(): void {
    this.resetEditForm();
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
    const data: SeedingReprogram = {
      fecha_nueva: this.editDate || undefined,
      lote: this.editLote || undefined,
      densidad_override_org_m2: this.editDensidad > 0 ? this.editDensidad : undefined,
      talla_inicial_override_g: this.editTalla > 0 ? this.editTalla : undefined,
      motivo: this.editMotivo || undefined
    };

    this.reprogram.emit({
      id: this.seeding.siembra_estanque_id,
      data
    });

    this.isEditing.set(false);
  }

  onConfirm(): void {
    this.confirm.emit(this.seeding.siembra_estanque_id);
  }

  // Helpers
  private resetEditForm(): void {
    this.editDate = this.seeding.fecha_tentativa || '';
    this.editLote = this.seeding.lote || '';
    this.editDensidad = this.seeding.densidad_efectiva;
    this.editTalla = this.seeding.talla_inicial_efectiva;
    this.editMotivo = '';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr + 'T00:00:00'); // Forzar medianoche local sin conversion
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusText(): string {
    const statusMap: Record<string, string> = {
      'p': 'Planificada',
      'e': 'En Ejecución',
      'f': 'Confirmada'
    };
    return statusMap[this.seeding.status] || 'Desconocido';
  }

  getStatusClass(): string {
    const classMap: Record<string, string> = {
      'p': 'status-planned',
      'e': 'status-active',
      'f': 'status-confirmed'
    };
    return classMap[this.seeding.status] || '';
  }

  get isConfirmed(): boolean {
    return this.seeding.status === 'f';
  }

  get canEdit(): boolean {
    return !this.isConfirmed;
  }

  get canConfirm(): boolean {
    return this.seeding.status === 'p';
  }
}