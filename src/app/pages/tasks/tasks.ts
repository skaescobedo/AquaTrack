// pages/tasks/tasks.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Package, AlertCircle } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TaskService } from '../../services/tasks';
import { CycleService } from '../../services/cycles';
import { Task, TaskListItem, TaskUpdateStatus } from '../../models/task.model';

import { TaskHeader, TaskFilterEvent } from './task-header/task-header';
import { TaskCard } from './task-card/task-card';
import { TaskModal } from './task-modal/task-modal';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    TaskHeader,
    TaskCard,
    TaskModal
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {
  readonly Package = Package;
  readonly AlertCircle = AlertCircle;

  farmId: number | null = null;
  
  // Estado
  tasks = signal<TaskListItem[]>([]);
  activeCycleId = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtros
  filterStatus = signal<string>('all');
  searchTerm = signal<string>('');
  daysBack = signal<number>(30);

  // UI State
  showTaskModal = signal(false);
  selectedTask = signal<Task | null>(null);
  modalMode = signal<'create' | 'edit'>('create');

  // Computed: Tareas filtradas
  filteredTasks = computed(() => {
    let result = this.tasks();

    // Filtrar por estado
    const status = this.filterStatus();
    if (status !== 'all') {
      result = result.filter(t => t.status === status);
    }

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(t =>
        t.titulo.toLowerCase().includes(search)
      );
    }

    // Filtrar por días hacia atrás
    const days = this.daysBack();
    if (days > 0) {
      result = this.taskService.filterTasksByDaysBack(result, days);
    }

    return result;
  });

  // Computed: Estadísticas
  stats = computed(() => {
    const all = this.filteredTasks();
    return {
      total: all.length,
      pendientes: all.filter(t => t.status === 'p').length,
      en_progreso: all.filter(t => t.status === 'e').length,
      completadas: all.filter(t => t.status === 'c').length
    };
  });

  constructor(
    private taskService: TaskService,
    private cycleService: CycleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🔍 Tasks - ngOnInit');
    
    this.route.parent?.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
      console.log('🏭 Farm ID:', this.farmId);

      if (this.farmId) {
        this.loadData();
      } else {
        console.error('❌ No se encontró farmId');
        this.loading.set(false);
        this.error.set('No se pudo obtener el ID de la granja');
      }
    });
  }

  loadData(): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    // Cargar ciclo activo y tareas en paralelo
    forkJoin({
      cycle: this.cycleService.getActiveCycle(this.farmId).pipe(
        catchError(() => of(null))
      ),
      tasks: this.taskService.getTasksByFarm(this.farmId, {
        limit: 500
      })
    }).subscribe({
      next: ({ cycle, tasks }) => {
        console.log('✅ Ciclo activo:', cycle);
        console.log('✅ Tareas cargadas:', tasks.length);

        this.activeCycleId.set(cycle?.ciclo_id || null);
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading tasks:', err);
        this.error.set('Error al cargar las tareas');
        this.loading.set(false);
      }
    });
  }

  // Handlers de eventos
  onFilterChange(event: TaskFilterEvent): void {
    console.log('🔍 Filter change:', event);
    this.filterStatus.set(event.status);
    this.searchTerm.set(event.search);
    this.daysBack.set(event.daysBack);
  }

  onCreateTask(): void {
    this.modalMode.set('create');
    this.selectedTask.set(null);
    this.showTaskModal.set(true);
  }

  onEditTask(taskId: number): void {
    this.loading.set(true);
    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        this.selectedTask.set(task);
        this.modalMode.set('edit');
        this.showTaskModal.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.loading.set(false);
      }
    });
  }

  onTaskCreated(task: Task): void {
    this.showTaskModal.set(false);
    this.loadData();
  }

  onTaskUpdated(task: Task): void {
    this.showTaskModal.set(false);
    this.loadData();
  }

  onCompleteTask(taskId: number): void {
    const data: TaskUpdateStatus = {
      status: 'c',
      progreso_pct: 100
    };

    this.taskService.updateTaskStatus(taskId, data).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error completing task:', err);
        alert('Error al completar la tarea');
      }
    });
  }

  onDeleteTask(taskId: number): void {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        alert('Error al eliminar la tarea');
      }
    });
  }

  onProgressUpdated(): void {
    // Recargar la lista para reflejar los cambios
    this.loadData();
  }

  // Getters
  get hasTasks(): boolean {
    return this.tasks().length > 0;
  }
}