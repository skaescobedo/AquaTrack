// services/tasks.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Task,
  TaskListItem,
  TaskCreate,
  TaskUpdate,
  TaskUpdateStatus,
  TaskFilters,
  TaskStats
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // ============================================================================
  // CRUD Básico
  // ============================================================================

  /**
   * Crear nueva tarea en una granja
   */
  createTask(farmId: number, data: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/farms/${farmId}`, data);
  }

  /**
   * Obtener detalle de una tarea
   */
  getTask(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${taskId}`);
  }

  /**
   * Actualizar tarea completa
   */
  updateTask(taskId: number, data: TaskUpdate): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${taskId}`, data);
  }

  /**
   * Actualizar solo status y progreso (operación rápida)
   */
  updateTaskStatus(taskId: number, data: TaskUpdateStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${taskId}/status`, data);
  }

  /**
   * Eliminar tarea
   */
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskId}`);
  }

  /**
   * Duplicar tarea (útil para recurrentes)
   */
  duplicateTask(taskId: number): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/${taskId}/duplicate`, {});
  }

  // ============================================================================
  // Queries y Filtros
  // ============================================================================

  /**
   * Listar tareas de una granja con filtros opcionales
   */
  getTasksByFarm(farmId: number, filters?: TaskFilters): Observable<TaskListItem[]> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.asignado_a) {
      params = params.set('asignado_a', filters.asignado_a.toString());
    }
    if (filters?.ciclo_id) {
      params = params.set('ciclo_id', filters.ciclo_id.toString());
    }
    if (filters?.skip !== undefined) {
      params = params.set('skip', filters.skip.toString());
    }
    if (filters?.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<TaskListItem[]>(`${this.API_URL}/farms/${farmId}`, { params });
  }

  /**
   * Listar tareas de un usuario
   */
  getUserTasks(
    userId: number,
    options?: {
      farmId?: number;
      status?: string;
      includeCreated?: boolean;
      skip?: number;
      limit?: number;
    }
  ): Observable<TaskListItem[]> {
    let params = new HttpParams();

    if (options?.farmId) {
      params = params.set('granja_id', options.farmId.toString());
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.includeCreated !== undefined) {
      params = params.set('include_created', options.includeCreated.toString());
    }
    if (options?.skip !== undefined) {
      params = params.set('skip', options.skip.toString());
    }
    if (options?.limit !== undefined) {
      params = params.set('limit', options.limit.toString());
    }

    return this.http.get<TaskListItem[]>(`${this.API_URL}/users/${userId}/tasks`, { params });
  }

  /**
   * Listar tareas vencidas de una granja
   */
  getOverdueTasks(farmId: number): Observable<TaskListItem[]> {
    return this.http.get<TaskListItem[]>(`${this.API_URL}/farms/${farmId}/overdue`);
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Obtener estadísticas de tareas de una granja
   */
  getTaskStats(farmId: number): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.API_URL}/farms/${farmId}/stats`);
  }

  // ============================================================================
  // Métodos auxiliares para filtrado local
  // ============================================================================

  /**
   * Filtrar tareas por rango de días hacia atrás
   * (esto se hace en el frontend porque el backend no tiene este endpoint aún)
   */
  filterTasksByDaysBack(tasks: TaskListItem[], daysBack: number): TaskListItem[] {
    if (daysBack <= 0) return tasks;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    cutoffDate.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      const createdAt = new Date(task.created_at);
      return createdAt >= cutoffDate;
    });
  }

  /**
   * Filtrar tareas por búsqueda de texto (título)
   */
  filterTasksBySearch(tasks: TaskListItem[], searchTerm: string): TaskListItem[] {
    if (!searchTerm || searchTerm.trim() === '') return tasks;

    const term = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.titulo.toLowerCase().includes(term)
    );
  }
}