/**
 * Modelos para el módulo de Proyecciones
 */

export type ProjectionStatus = 'b' | 'p' | 'r' | 'x'; // borrador, publicada, reforecast, cancelada
export type ProjectionSourceType = 'planes' | 'archivo' | 'reforecast';

/**
 * Línea de proyección semanal
 */
export interface ProjectionLine {
  proyeccion_linea_id: number;
  proyeccion_id: number;
  edad_dias: number;
  semana_idx: number;
  fecha_plan: string; // ISO date
  pp_g: number; // peso promedio en gramos
  incremento_g_sem?: number;
  sob_pct_linea: number; // sobrevivencia porcentual
  cosecha_flag: boolean;
  retiro_org_m2?: number;
  nota?: string;
}

export interface CycleContext {
  densidad_base_org_m2: number;
  superficie_total_m2: number;
  estanques_count: number;
  fecha_inicio: string; // ISO date
}


/**
 * Proyección básica (sin líneas)
 */
export interface Projection {
  proyeccion_id: number;
  ciclo_id: number;
  version: string;
  descripcion?: string;
  sob_final_objetivo_pct?: number;
  siembra_ventana_fin?: string; // ISO date
  status: ProjectionStatus;
  is_current: boolean;
  published_at?: string; // ISO datetime
  creada_por?: number;
  source_type?: ProjectionSourceType;
  source_ref?: string;
  parent_version_id?: number;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Proyección completa con líneas semanales
 */
/**
 * Proyección completa con líneas semanales y contexto del ciclo
 */
export interface ProjectionDetail extends Projection {
  lineas: ProjectionLine[];
  contexto_ciclo?: CycleContext;  // ← AGREGAR ESTA LÍNEA
}

/**
 * Respuesta al crear proyección desde archivo
 */
export interface ProjectionFromFileResponse extends ProjectionDetail {
  warnings?: string[];
}

/**
 * Payload para actualizar proyección
 */
export interface ProjectionUpdate {
  descripcion?: string;
  sob_final_objetivo_pct?: number;
  siembra_ventana_fin?: string; // ISO date
}

/**
 * Payload para publicar proyección
 */
export interface ProjectionPublish {
  confirmar_publicacion: boolean;
}

/**
 * Labels para estados de proyección
 */
export const PROJECTION_STATUS_LABELS: Record<ProjectionStatus, string> = {
  b: 'Borrador',
  p: 'Publicada',
  r: 'Reforecast',
  x: 'Cancelada'
};

/**
 * Colores para badges de estado
 */
export const PROJECTION_STATUS_COLORS: Record<ProjectionStatus, string> = {
  b: 'gray',
  p: 'green',
  r: 'blue',
  x: 'red'
};