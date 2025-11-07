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
}

export interface PuntoCrecimiento {
  semana: number;
  pp_proyectado_g: number;
  fecha: string;
}

export interface PuntoBiomasa {
  semana: number;
  biomasa_kg: number;
  fecha: string;
}

export interface PuntoDensidad {
  semana: number;
  densidad_org_m2: number;
  fecha: string;
}

export interface ProximaSiembra {
  estanque_id: number;
  estanque_nombre: string;
  fecha_tentativa: string;
  dias_diferencia: number;
  estado: string;
}

export interface ProximaCosecha {
  ola_id: number;
  nombre: string;
  tipo: string;
  ventana_inicio: string;
  ventana_fin: string;
  dias_hasta_inicio: number;
  estado: string;
  estanques_pendientes: number;
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