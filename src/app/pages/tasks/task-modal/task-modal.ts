// pages/tasks/task-modal/task-modal.ts
import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Plus, Save } from 'lucide-angular';
import { TaskService } from '../../../services/tasks';
import { UserService } from '../../../services/users';
import { PondService } from '../../../services/ponds';
import { Task, TaskCreate, TaskUpdate, TaskPriority, UserBasic } from '../../../models/task.model';
import { Pond } from '../../../models/pond.model';
import { UserOut } from '../../../models/user.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss'
})
export class TaskModal implements OnInit {
  readonly X = X;
  readonly Plus = Plus;
  readonly Save = Save;

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() task: Task | null = null;
  @Input({ required: true }) farmId!: number;
  @Input() cycleId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Task>();
  @Output() updated = new EventEmitter<Task>();

  // Form data
  titulo = '';
  descripcion = '';
  tipo = '';
  prioridad: TaskPriority = 'm';
  fecha_limite = '';
  tiempo_estimado_horas: number | null = null;
  es_recurrente = false;
  estanque_id: number | null = null;
  asignados_ids: number[] = [];

  // Options
  usuarios = signal<UserOut[]>([]);
  estanques = signal<Pond[]>([]);

  // UI State
  loading = signal(false);
  error = signal<string | null>(null);

  // Tipos de tarea predefinidos
  tiposComunes = [
    'Biometría',
    'Mantenimiento',
    'Control de calidad',
    'Alimentación',
    'Limpieza',
    'Inspección',
    'Otra'
  ];

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private pondService: PondService
  ) {}

  ngOnInit(): void {
    this.loadOptions();
    
    if (this.mode === 'edit' && this.task) {
      this.populateForm();
    }
  }

  loadOptions(): void {
    // Cargar usuarios de la granja
    this.userService.getUsers(this.farmId, 'a').subscribe({
      next: (users) => {
        this.usuarios.set(users);
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });

    // Cargar estanques
    this.pondService.getPonds(this.farmId).subscribe({
      next: (ponds) => {
        this.estanques.set(ponds);
      },
      error: (err) => {
        console.error('Error loading ponds:', err);
      }
    });
  }

  populateForm(): void {
    if (!this.task) return;

    this.titulo = this.task.titulo;
    this.descripcion = this.task.descripcion || '';
    this.tipo = this.task.tipo || '';
    this.prioridad = this.task.prioridad;
    this.fecha_limite = this.task.fecha_limite || '';
    this.tiempo_estimado_horas = this.task.tiempo_estimado_horas;
    this.es_recurrente = this.task.es_recurrente;
    this.estanque_id = this.task.estanque_id;
    this.asignados_ids = this.task.asignaciones.map(a => a.usuario.usuario_id);
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (this.mode === 'create') {
      this.createTask();
    } else {
      this.updateTask();
    }
  }

  createTask(): void {
    const data: TaskCreate = {
      ciclo_id: this.cycleId,
      estanque_id: this.estanque_id || null,
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim() || undefined,
      prioridad: this.prioridad,
      fecha_limite: this.fecha_limite || undefined,
      tiempo_estimado_horas: this.tiempo_estimado_horas || undefined,
      tipo: this.tipo.trim() || undefined,
      es_recurrente: this.es_recurrente,
      asignados_ids: this.asignados_ids.length > 0 ? this.asignados_ids : undefined
    };

    this.taskService.createTask(this.farmId, data).subscribe({
      next: (task) => {
        this.loading.set(false);
        this.created.emit(task);
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.error.set(err.error?.detail || 'Error al crear la tarea');
        this.loading.set(false);
      }
    });
  }

  updateTask(): void {
    if (!this.task) return;

    const data: TaskUpdate = {
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim() || undefined,
      prioridad: this.prioridad,
      fecha_limite: this.fecha_limite || undefined,
      tiempo_estimado_horas: this.tiempo_estimado_horas || undefined,
      tipo: this.tipo.trim() || undefined,
      es_recurrente: this.es_recurrente,
      asignados_ids: this.asignados_ids.length > 0 ? this.asignados_ids : undefined
    };

    this.taskService.updateTask(this.task.tarea_id, data).subscribe({
      next: (task) => {
        this.loading.set(false);
        this.updated.emit(task);
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.error.set(err.error?.detail || 'Error al actualizar la tarea');
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    if (!this.loading()) {
      this.close.emit();
    }
  }

  toggleAsignado(userId: number): void {
    const index = this.asignados_ids.indexOf(userId);
    if (index === -1) {
      this.asignados_ids.push(userId);
    } else {
      this.asignados_ids.splice(index, 1);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.asignados_ids.includes(userId);
  }

  isValid(): boolean {
    return this.titulo.trim().length > 0;
  }

  get modalTitle(): string {
    return this.mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea';
  }

  get submitButtonText(): string {
    return this.mode === 'create' ? 'Crear Tarea' : 'Guardar Cambios';
  }
}