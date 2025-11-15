// pages/tasks/task-header/task-header.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, Plus } from 'lucide-angular';
import { TaskStatus } from '../../../models/task.model';

export interface TaskFilterEvent {
  status: string; // 'all' | TaskStatus
  search: string;
  daysBack: number;
}

@Component({
  selector: 'app-task-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './task-header.html',
  styleUrl: './task-header.scss'
})
export class TaskHeader {
  readonly Search = Search;
  readonly Filter = Filter;
  readonly Plus = Plus;

  @Input() title = 'Bitácora de tareas';
  @Input() subtitle = 'Si alguna va fue realizada confirma que se completó';
  @Output() filterChange = new EventEmitter<TaskFilterEvent>();
  @Output() createTask = new EventEmitter<void>();

  // Estado de filtros
  selectedStatus = signal<string>('all');
  searchTerm = signal<string>('');
  daysBack = signal<number>(30); // Default: 30 días

  // Opciones de filtro
  statusOptions = [
    { value: 'all', label: 'Todas las tareas' },
    { value: 'p', label: 'Pendientes' },
    { value: 'e', label: 'En Progreso' },
    { value: 'c', label: 'Completadas' },
    { value: 'x', label: 'Canceladas' }
  ];

  daysBackOptions = [
    { value: 7, label: '7 días' },
    { value: 15, label: '15 días' },
    { value: 30, label: '30 días' },
    { value: 60, label: '60 días' },
    { value: 90, label: '90 días' },
    { value: 365, label: '1 año' },
    { value: 0, label: 'Todas' }
  ];

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.emitFilterChange();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.emitFilterChange();
  }

  onDaysBackChange(value: number): void {
    this.daysBack.set(value);
    this.emitFilterChange();
  }

  onCreateTask(): void {
    this.createTask.emit();
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      status: this.selectedStatus(),
      search: this.searchTerm(),
      daysBack: this.daysBack()
    });
  }
}