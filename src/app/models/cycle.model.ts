export interface Cycle {
  ciclo_id: number;
  granja_id: number;
  nombre: string;
  fecha_inicio: string; // ISO date
  fecha_fin?: string; // ISO date
  dias_transcurridos: number;
  status: 'activo' | 'finalizado' | 'cancelado';
  biomasa_total_kg: number;
  densidad_promedio: number;
  estanques_activos: number;
  created_at: string;
  updated_at: string;
}

export interface CycleCreate {
  granja_id: number;
  nombre: string;
  fecha_inicio: string; // ISO date format: YYYY-MM-DD
  fecha_fin_planificada?: string; // Opcional
  archivo_proyeccion?: File; // Para upload de Excel/CSV/PDF
}

export interface CycleUpdate {
  nombre?: string;
  fecha_fin?: string;
  status?: 'activo' | 'finalizado' | 'cancelado';
}