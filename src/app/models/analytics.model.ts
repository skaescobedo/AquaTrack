// src/app/models/analytics.model.ts

// ============================================
// CYCLE OVERVIEW (Dashboard general del ciclo)
// ============================================

export interface CycleOverview {
  ciclo_id: number;
  nombre: string;
  fecha_inicio: string;
  kpis: CycleKPIs;
  graficas: CycleGraficas;
  proximas_siembras: ProximaSiembra[];
  proximas_cosechas: ProximaCosecha[];
  por_estanque: EstanqueDetalle[];
}

export interface CycleKPIs {
  dias_ciclo: number;
  biomasa_total_kg: number;
  densidad_promedio_org_m2: number;
  sob_operativo_prom_pct: number;
  pp_promedio_g: number;
  sample_sizes: {
    ponds_total: number;
    ponds_with_density: number;
    ponds_with_org_vivos: number;
  };
  estados: {
    activos: number;
    en_siembra: number;
    en_cosecha: number;
    finalizados: number;
  };
}

export interface CycleGraficas {
  crecimiento: PuntoCrecimiento[];
  biomasa_evolucion: PuntoBiomasa[];
  densidad_evolucion: PuntoDensidad[];
  sob_evolucion: PuntoSOB[];
}

// ============================================
// GRÁFICAS DEL CICLO (V3 - Doble línea)
// ============================================

export interface PuntoCrecimiento {
  semana: number;
  pp_proyectado_original_g?: number;
  pp_ajustado_g?: number;
  fecha: string;
  tiene_datos_reales: boolean;
}

export interface PuntoBiomasa {
  semana: number;
  biomasa_proyectada_original_kg?: number;
  biomasa_ajustada_kg?: number;
  fecha: string;
  tiene_datos_reales: boolean;
}

export interface PuntoDensidad {
  semana: number;
  densidad_proyectada_original_org_m2?: number;
  densidad_ajustada_org_m2?: number;
  fecha: string;
  tiene_datos_reales: boolean;
}

export interface PuntoSOB {
  semana: number;
  sob_proyectado_original_pct?: number;
  sob_ajustado_pct?: number;
  fecha: string;
  tiene_datos_reales: boolean;
}

export interface ProximaSiembra {
  estanque_id: number;
  estanque_nombre: string;
  fecha_tentativa: string;
  dias_diferencia: number;
  estado: string;
}

export interface ProximaCosecha {
  cosecha_ola_id: number;
  tipo: string;
  ventana_inicio: string;
  ventana_fin: string;
  estanques_pendientes: number;
  dias_diferencia: number;
  estado: string;
}

export interface EstanqueDetalle {
  estanque_id: number;
  nombre: string;
  superficie_m2: number;
  densidad_base_org_m2: number;
  densidad_retirada_acum_org_m2: number;
  densidad_viva_org_m2: number;
  sob_vigente_pct: number;
  sob_fuente: string;
  pp_vigente_g: number;
  pp_fuente: string;
  pp_updated_at: string | null;
  org_vivos_est: number;
  biomasa_est_kg: number;
}

// ============================================
// POND DETAIL (Dashboard individual del estanque)
// ============================================

export interface PondDetail {
  estanque_id: number;
  nombre: string;
  status: string;
  kpis: PondKPIs;
  graficas: PondGraficas;
  detalles: PondDetalles;
}

export interface PondKPIs {
  biomasa_estimada_kg: number;
  densidad_actual_org_m2: number;
  org_vivos: number;
  pp_g: number;
  pp_fuente: string;
  pp_updated_at: string | null;
  supervivencia_pct: number;
  sob_fuente: string;
}

export interface PondGraficas {
  crecimiento: PuntoCrecimientoPond[];
  densidad_evolucion: PuntoDensidadPond[];
  biomasa_evolucion: PuntoBiomasaPond[];
  sob_evolucion: PuntoSOBPond[];
}

// ============================================
// 🔄 GRÁFICAS DEL POND (Versión Híbrida)
// ============================================

// ✅ Gráfica de Crecimiento del Pond (proyectado + real)
export interface PuntoCrecimientoPond {
  semana: number;
  pp_proyectado_g: number;      // De proyección published (siempre presente)
  pp_real_g?: number;           // De biometría (opcional)
  fecha: string;
}

// ✅ Gráfica de Densidad del Pond (proyectado + real)
export interface PuntoDensidadPond {
  semana: number;
  densidad_proyectada_org_m2: number;  // De proyección published (siempre presente)
  densidad_real_org_m2?: number;       // De biometría (opcional)
  fecha: string;
}

// ✅ Gráfica de Biomasa del Pond (proyectado + real)
export interface PuntoBiomasaPond {
  semana: number;
  biomasa_proyectada_kg: number;  // De proyección published (siempre presente)
  biomasa_real_kg?: number;       // De biometría (opcional)
  fecha: string;
}

// ✅ Gráfica de SOB del Pond (proyectado + real)
export interface PuntoSOBPond {
  semana: number;
  sob_proyectado_pct: number;  // De proyección published (siempre presente)
  sob_real_pct?: number;       // De biometría (opcional)
  fecha: string;
}

export interface PondDetalles {
  superficie_m2: number;
  densidad_inicial_org_m2: number | null;
  dias_cultivo: number;
  tasa_crecimiento_g_sem: number | null;
  biomasa_m2: number;
}