export interface SeedingPlan {
  siembra_plan_id: number;
  ciclo_id: number;
  ventana_inicio: string;
  ventana_fin: string;
  densidad_org_m2: number;
  talla_inicial_g: number;
  status: 'p' | 'e' | 'f'; // p=planeado, e=en ejecución, f=finalizado
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface Seeding {
  siembra_estanque_id: number;
  siembra_plan_id: number;
  estanque_id: number;
  status: 'p' | 'e' | 'f'; // p=pendiente, e=en ejecución, f=finalizada
  fecha_tentativa: string | null;
  fecha_siembra: string | null;
  lote: string | null;
  densidad_override_org_m2: number | null;
  talla_inicial_override_g: number | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeedingPlanWithItems extends SeedingPlan {
  siembras: Seeding[];
}

export interface SeedingPlanCreate {
  ventana_inicio: string;
  ventana_fin: string;
  densidad_org_m2: number;
  talla_inicial_g: number;
  observaciones?: string;
}

export interface SeedingCreateForPond {
  fecha_tentativa?: string;
  lote?: string;
  densidad_override_org_m2?: number;
  talla_inicial_override_g?: number;
  observaciones?: string;
}

export interface SeedingReprogram {
  fecha_nueva?: string;
  lote?: string;
  densidad_override_org_m2?: number;
  talla_inicial_override_g?: number;
  motivo?: string;
}

export interface SeedingWithPondInfo extends Seeding {
  pond_name: string;
  pond_superficie: number;
  // Valores efectivos (override o del plan)
  densidad_efectiva: number;
  talla_inicial_efectiva: number;
}