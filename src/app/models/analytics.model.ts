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
  sob_evolucion: PuntoSOB[];  // 🆕 Nueva gráfica
}

// ============================================
// GRÁFICAS DEL CICLO (V3 - Doble línea)
// ============================================

// ✅ Gráfica de Crecimiento (PP)
export interface PuntoCrecimiento {
  semana: number;
  pp_proyectado_original_g?: number;  // ✅ Opcional (puede no existir si solo hay draft)
  pp_ajustado_g?: number;              // ✅ Opcional (puede no existir si solo hay published)
  fecha: string;
  tiene_datos_reales: boolean;
}

// ✅ Gráfica de Biomasa (ACTUALIZADA V3)
export interface PuntoBiomasa {
  semana: number;
  biomasa_proyectada_original_kg?: number;  // 🆕 Plan publicado
  biomasa_ajustada_kg?: number;             // 🆕 Borrador ajustado
  fecha: string;
  tiene_datos_reales: boolean;              // 🆕 Indica si hay anclaje
}

// ✅ Gráfica de Densidad (ACTUALIZADA V3)
export interface PuntoDensidad {
  semana: number;
  densidad_proyectada_original_org_m2?: number;  // 🆕 Plan publicado
  densidad_ajustada_org_m2?: number;             // 🆕 Borrador ajustado
  fecha: string;
  tiene_datos_reales: boolean;                   // 🆕 Indica si hay anclaje
}

// 🆕 Gráfica de SOB (NUEVA V3)
export interface PuntoSOB {
  semana: number;
  sob_proyectado_original_pct?: number;  // Plan publicado
  sob_ajustado_pct?: number;             // Borrador ajustado
  fecha: string;
  tiene_datos_reales: boolean;           // Indica si hay anclaje
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
}

// ============================================
// 🔄 GRÁFICAS DEL POND (Versión Simple - Sin doble línea)
// ============================================

// ✅ Gráfica de Crecimiento del Pond (VERSIÓN SIMPLE)
export interface PuntoCrecimientoPond {
  semana: number;
  pp_g: number;      // ✅ Propiedad simple (no opcional)
  fecha: string;
}

// ✅ Gráfica de Densidad del Pond (VERSIÓN SIMPLE)
export interface PuntoDensidadPond {
  semana: number;
  densidad_org_m2: number;  // ✅ Propiedad simple (no opcional)
  fecha: string;
}

export interface PondDetalles {
  superficie_m2: number;
  densidad_inicial_org_m2: number | null;
  dias_cultivo: number;
  tasa_crecimiento_g_sem: number | null;
  biomasa_m2: number;
}