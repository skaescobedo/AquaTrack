// models/task.model.ts

// ============================================================================
// Enums y Types
// ============================================================================

export type TaskStatus = 'p' | 'e' | 'c' | 'x'; // pendiente/en progreso/completada/cancelada
export type TaskPriority = 'b' | 'm' | 'a'; // baja/media/alta

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'p': 'Pendiente',
  'e': 'En Progreso',
  'c': 'Completada',
  'x': 'Cancelada'
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  'b': 'Baja',
  'm': 'Media',
  'a': 'Alta'
};

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  'p': 'status-pending',
  'e': 'status-progress',
  'c': 'status-completed',
  'x': 'status-cancelled'
};

export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  'b': 'priority-low',
  'm': 'priority-medium',
  'a': 'priority-high'
};

// ============================================================================
// Interfaces Base
// ============================================================================

export interface UserBasic {
  usuario_id: number;
  nombre: string;
  apellido1: string;
  email: string;
  nombre_completo?: string;
}

export interface TaskAssignment {
  asignacion_id: number;
  usuario: UserBasic;
  created_at: string;
}

// ============================================================================
// DTOs de Entrada (Create/Update)
// ============================================================================

export interface TaskCreate {
  ciclo_id?: number | null;
  estanque_id?: number | null;
  titulo: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fecha_limite?: string; // ISO date string (YYYY-MM-DD)
  tiempo_estimado_horas?: number;
  tipo?: string;
  es_recurrente?: boolean;
  asignados_ids?: number[];
}

export interface TaskUpdate {
  titulo?: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fecha_limite?: string;
  tiempo_estimado_horas?: number;
  progreso_pct?: number;
  status?: TaskStatus;
  tipo?: string;
  es_recurrente?: boolean;
  asignados_ids?: number[];
}

export interface TaskUpdateStatus {
  status: TaskStatus;
  progreso_pct?: number;
}

// ============================================================================
// DTOs de Salida (Response)
// ============================================================================

export interface Task {
  tarea_id: number;
  granja_id: number | null;
  ciclo_id: number | null;
  estanque_id: number | null;
  titulo: string;
  descripcion: string | null;
  prioridad: TaskPriority;
  status: TaskStatus;
  tipo: string | null;
  fecha_limite: string | null; // ISO date string
  tiempo_estimado_horas: number | null;
  progreso_pct: number;
  es_recurrente: boolean;
  created_by: number;
  creador: UserBasic;
  asignaciones: TaskAssignment[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  
  // Computed fields (vienen del backend)
  responsables_nombres: string[];
  dias_restantes: number | null;
  is_vencida: boolean;
}

export interface TaskListItem {
  tarea_id: number;
  titulo: string;
  prioridad: TaskPriority;
  status: TaskStatus;
  tipo: string | null;
  fecha_limite: string | null;
  progreso_pct: number;
  created_by: number;
  asignados_count: number;
  responsables_nombres: string[];
  created_at: string;
}

// ============================================================================
// Filtros y Queries
// ============================================================================

export interface TaskFilters {
  status?: TaskStatus;
  asignado_a?: number;
  ciclo_id?: number;
  search?: string;
  days_back?: number; // Días hacia atrás para filtrar por created_at
  skip?: number;
  limit?: number;
}

export interface TaskStats {
  total: number;
  por_estado: {
    p: number;
    e: number;
    c: number;
    x: number;
  };
  por_prioridad: {
    b: number;
    m: number;
    a: number;
  };
  vencidas: number;
  completadas_este_mes: number;
}

// ============================================================================
// Helpers
// ============================================================================

export function getTaskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status] || 'Desconocido';
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority] || 'Desconocido';
}

export function getTaskStatusBadgeClass(status: TaskStatus): string {
  return TASK_STATUS_BADGE_CLASSES[status] || '';
}

export function getTaskPriorityBadgeClass(priority: TaskPriority): string {
  return TASK_PRIORITY_BADGE_CLASSES[priority] || '';
}

export function calculateDaysRemaining(fechaLimite: string | null): number | null {
  if (!fechaLimite) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite);
  const diffTime = limite.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.fecha_limite) return false;
  if (task.status === 'c' || task.status === 'x') return false;
  const daysRemaining = calculateDaysRemaining(task.fecha_limite);
  return daysRemaining !== null && daysRemaining < 0;
}