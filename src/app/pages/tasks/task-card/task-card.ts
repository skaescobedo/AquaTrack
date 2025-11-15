// pages/tasks/task-card/task-card.ts
import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, User, Clock, CheckCircle, ChevronDown, ChevronUp, Edit2, Trash2, Check } from 'lucide-angular';
import { 
  Task,
  TaskListItem,
  TaskUpdateStatus,
  getTaskStatusLabel, 
  getTaskPriorityLabel,
  getTaskStatusBadgeClass,
  getTaskPriorityBadgeClass,
  calculateDaysRemaining
} from '../../../models/task.model';
import { TaskService } from '../../../services/tasks';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss'
})
export class TaskCard {
  readonly Calendar = Calendar;
  readonly User = User;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Check = Check;

  @Input({ required: true }) task!: TaskListItem;
  @Output() complete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() progressUpdated = new EventEmitter<void>();

  private taskService = inject(TaskService);

  isExpanded = signal(false);
  taskDetail = signal<Task | null>(null);
  loadingDetail = signal(false);
  
  // Control de progreso
  currentProgress = signal<number>(0);
  savingProgress = signal(false);
  private progressTimeout: any;

  // Getters básicos (del TaskListItem)
  get statusLabel(): string {
    return getTaskStatusLabel(this.task.status);
  }

  get priorityLabel(): string {
    return getTaskPriorityLabel(this.task.prioridad);
  }

  get statusBadgeClass(): string {
    return getTaskStatusBadgeClass(this.task.status);
  }

  get priorityBadgeClass(): string {
    return getTaskPriorityBadgeClass(this.task.prioridad);
  }

  get daysRemaining(): number | null {
    return calculateDaysRemaining(this.task.fecha_limite);
  }

  get daysLabel(): string {
    const days = this.daysRemaining;
    if (days === null) return '';
    if (days < 0) return `${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''} vencida`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return '1 día';
    return `${days} días`;
  }

  getDaysBadgeClass(): string {
    const days = this.daysRemaining;
    if (days === null) return 'days-badge-default';
    if (days < 0) return 'days-badge-overdue';
    if (days === 0) return 'days-badge-today';
    if (days <= 3) return 'days-badge-soon';
    return 'days-badge-default';
  }

  get isPending(): boolean {
    return this.task.status === 'p';
  }

  get isCompleted(): boolean {
    return this.task.status === 'c';
  }

  get isCancelled(): boolean {
    return this.task.status === 'x';
  }

  get canComplete(): boolean {
    return this.isPending || this.task.status === 'e';
  }

  get canEdit(): boolean {
    return !this.isCompleted && !this.isCancelled;
  }

  // Getters del detalle (requieren cargar taskDetail)
  get hasDescription(): boolean {
    const detail = this.taskDetail();
    return !!detail?.descripcion;
  }

  get hasEstimatedTime(): boolean {
    const detail = this.taskDetail();
    return !!detail?.tiempo_estimado_horas && detail.tiempo_estimado_horas > 0;
  }

  get isRecurrent(): boolean {
    const detail = this.taskDetail();
    return detail?.es_recurrente === true;
  }

  getDescription(): string {
    return this.taskDetail()?.descripcion || 'Sin descripción';
  }

  getEstimatedTime(): string {
    const hours = this.taskDetail()?.tiempo_estimado_horas;
    if (!hours) return '';
    if (hours === 1) return '1 hora';
    if (hours < 1) return `${hours * 60} minutos`;
    return `${hours} horas`;
  }

  getCreatorName(): string {
    const detail = this.taskDetail();
    if (!detail?.creador) return 'Desconocido';
    return detail.creador.nombre_completo || 
           `${detail.creador.nombre} ${detail.creador.apellido1}`;
  }

  // Métodos para control de progreso
  onProgressChange(value: string): void {
    this.currentProgress.set(Number(value));
  }

  onProgressChangeComplete(): void {
    // Guardar después de un pequeño delay para evitar muchas requests
    if (this.progressTimeout) {
      clearTimeout(this.progressTimeout);
    }
    
    this.progressTimeout = setTimeout(() => {
      this.saveProgress();
    }, 500);
  }

  setProgress(value: number): void {
    this.currentProgress.set(value);
    this.saveProgress();
  }

  private saveProgress(): void {
    const newProgress = this.currentProgress();
    
    // Si llegó a 100%, cambiar status a completada
    const newStatus = newProgress >= 100 ? 'c' : 
                     newProgress > 0 ? 'e' : 
                     this.task.status;

    const data: TaskUpdateStatus = {
      status: newStatus as any,
      progreso_pct: newProgress
    };

    this.savingProgress.set(true);
    
    this.taskService.updateTaskStatus(this.task.tarea_id, data).subscribe({
      next: () => {
        console.log('✅ Progress updated');
        this.savingProgress.set(false);
        
        // Actualizar el task local
        this.task.progreso_pct = newProgress;
        this.task.status = newStatus as any;
        
        // Emitir evento para que el padre recargue
        this.progressUpdated.emit();
      },
      error: (err) => {
        console.error('❌ Error updating progress:', err);
        this.savingProgress.set(false);
        alert('Error al actualizar el progreso');
        
        // Revertir el progreso en la UI
        this.currentProgress.set(this.task.progreso_pct);
      }
    });
  }

  // Handlers
  toggleExpanded(): void {
    if (!this.isExpanded()) {
      // Al expandir, cargar el detalle si no está cargado
      this.loadTaskDetail();
      // Inicializar el progreso actual
      this.currentProgress.set(this.task.progreso_pct);
    }
    this.isExpanded.update(val => !val);
  }

  private loadTaskDetail(): void {
    if (this.taskDetail()) return; // Ya cargado

    this.loadingDetail.set(true);
    this.taskService.getTask(this.task.tarea_id).subscribe({
      next: (detail) => {
        console.log('✅ Task detail loaded:', detail);
        this.taskDetail.set(detail);
        this.loadingDetail.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading task detail:', err);
        this.loadingDetail.set(false);
      }
    });
  }

  onComplete(): void {
    this.complete.emit(this.task.tarea_id);
  }

  onEdit(): void {
    this.edit.emit(this.task.tarea_id);
  }

  onDelete(): void {
    this.delete.emit(this.task.tarea_id);
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
}