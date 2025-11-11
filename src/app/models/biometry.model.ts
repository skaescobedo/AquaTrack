// =====================================================
// 🟢 INPUT MODELS
// =====================================================

export interface BiometryCreate {
  n_muestra: number;
  peso_muestra_g: number;
  sob_usada_pct?: number;
  notas?: string;
  actualiza_sob_operativa: boolean;
  sob_fuente?: 'operativa_actual' | 'ajuste_manual' | 'reforecast';
  motivo_cambio_sob?: string;
}

export interface BiometryUpdate {
  notas?: string;
}

// =====================================================
// 🟣 OUTPUT MODELS
// =====================================================

export interface Biometry {
  biometria_id: number;
  ciclo_id: number;
  estanque_id: number;
  fecha: string;
  n_muestra: number;
  peso_muestra_g: number;
  pp_g: number;
  sob_usada_pct: number;
  incremento_g_sem: number | null;
  notas: string | null;
  actualiza_sob_operativa: boolean;
  sob_fuente: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface BiometryList {
  biometria_id: number;
  estanque_id: number;
  fecha: string;
  pp_g: number;
  sob_usada_pct: number;
  incremento_g_sem: number | null;
  actualiza_sob_operativa: boolean;
  notas: string | null;
  n_muestra?: number;
  peso_muestra_g?: number;
  created_at: string;
}

export interface BiometryCreateResponse {
  biometria: Biometry;
  reforecast_result: any | null;
}

// =====================================================
// 🔵 CONTEXT MODELS (para pre-carga en formulario)
// =====================================================

export interface SeedingContext {
  fecha_siembra: string;
  dias_ciclo: number;
  densidad_base_org_m2: number;
  talla_inicial_g: number;
}

export interface SOBOperative {
  valor_pct: number;
  fuente: string;
}

export interface EstimatedPopulation {
  densidad_efectiva_org_m2: number;
  organismos_totales: number;
}

export interface LastBiometryContext {
  fecha: string;
  pp_g: number;
  sob_usada_pct: number;
  dias_desde: number;
}

export interface CurrentProjectionContext {
  semana_actual: number;
  sob_proyectado_pct: number;
  pp_proyectado_g: number;
  fuente: 'draft' | 'published';
}

export interface BiometryContext {
  estanque_id: number;
  estanque_nombre: string;
  area_m2: number;
  sob_operativo_actual: SOBOperative;
  siembra: SeedingContext;
  retiros_acumulados_org_m2: number;
  poblacion_estimada: EstimatedPopulation;
  ultima_biometria: LastBiometryContext | null;
  proyeccion_vigente: CurrentProjectionContext | null;
}

// =====================================================
// 📊 SOB CHANGE LOG
// =====================================================

export interface SOBChangeLog {
  sob_cambio_log_id: number;
  estanque_id: number;
  ciclo_id: number;
  sob_anterior_pct: number;
  sob_nueva_pct: number;
  fuente: string;
  motivo: string | null;
  changed_by: number;
  changed_at: string;
}