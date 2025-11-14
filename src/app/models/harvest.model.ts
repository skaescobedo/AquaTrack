// =====================================================
// 🟢 ENTIDADES BASE
// =====================================================

/**
 * Ola de Cosecha (Wave)
 * Representa un grupo de cosechas programadas
 */
export interface HarvestWave {
  cosecha_ola_id: number;
  ciclo_id: number;
  nombre: string;
  tipo: 'p' | 'f';  // p=parcial, f=final
  ventana_inicio: string;  // ISO date "2025-12-01"
  ventana_fin: string;     // ISO date "2025-12-15"
  objetivo_retiro_org_m2: number | null;
  status: 'p' | 'r' | 'x';  // p=planeada, r=reprogramada, x=cancelada
  orden: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Línea de Cosecha (Harvest Line)
 * Representa la cosecha individual de un estanque
 */
export interface HarvestLine {
  cosecha_estanque_id: number;
  cosecha_ola_id: number;
  estanque_id: number;
  status: 'p' | 'c' | 'x';  // p=pendiente, c=confirmada, x=cancelada
  fecha_cosecha: string;    // ISO date
  pp_g: number | null;
  biomasa_kg: number | null;
  densidad_retirada_org_m2: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ola con sus líneas de cosecha
 */
export interface HarvestWaveWithItems extends HarvestWave {
  cosechas: HarvestLine[];
}

/**
 * Línea de cosecha enriquecida con info del estanque
 * Similar a SeedingWithPondInfo en seeding
 */
export interface HarvestLineWithPondInfo extends HarvestLine {
  pond_name: string;
  pond_superficie: number;
  // Valores calculados
  biomasa_estimada_kg?: number;
  organismos_estimados?: number;
}

// =====================================================
// 🟣 INPUT MODELS (para crear/editar)
// =====================================================

/**
 * Crear nueva ola de cosecha
 */
export interface HarvestWaveCreate {
  nombre: string;
  tipo: 'p' | 'f';
  ventana_inicio: string;  // "2025-12-01"
  ventana_fin: string;     // "2025-12-15"
  objetivo_retiro_org_m2?: number;
  orden?: number;
  notas?: string;
}

/**
 * Reprogramar fecha de una línea de cosecha
 */
export interface HarvestReprogram {
  fecha_nueva: string;  // "2025-12-20"
  motivo?: string;      // "Clima adverso"
}

/**
 * Confirmar cosecha con datos reales
 * DEBE incluir UNO de: biomasa_kg o densidad_retirada_org_m2
 */
export interface HarvestConfirm {
  biomasa_kg?: number;              // 500.5 kg
  densidad_retirada_org_m2?: number; // 25.0 org/m²
  notas?: string;
}

// =====================================================
// 🔵 COMPUTED/AGGREGATED DATA
// =====================================================

/**
 * Estadísticas de una ola
 */
export interface WaveStats {
  total_lines: number;
  pending_lines: number;
  confirmed_lines: number;
  cancelled_lines: number;
  completion_percentage: number;
  total_biomasa_confirmada_kg: number;
}

/**
 * Estadísticas globales de cosechas del ciclo
 */
export interface HarvestCycleStats {
  total_waves: number;
  active_waves: number;
  cancelled_waves: number;
  total_lines: number;
  confirmed_lines: number;
  pending_lines: number;
  total_biomasa_cosechada_kg: number;
}

// =====================================================
// 🎨 UI HELPERS
// =====================================================

/**
 * Obtiene el label legible del tipo de ola
 */
export function getWaveTypeLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'p': 'Parcial',
    'f': 'Final'
  };
  return labels[tipo] || tipo;
}

/**
 * Obtiene el label legible del status de ola
 */
export function getWaveStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'p': 'Planeada',
    'r': 'Reprogramada',
    'x': 'Cancelada'
  };
  return labels[status] || status;
}

/**
 * Obtiene el label legible del status de línea
 */
export function getHarvestLineStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'p': 'Pendiente',
    'c': 'Confirmada',
    'x': 'Cancelada'
  };
  return labels[status] || status;
}

/**
 * Obtiene la clase CSS para el badge del tipo de ola
 */
export function getWaveTypeBadgeClass(tipo: string): string {
  const classes: Record<string, string> = {
    'p': 'badge-warning',  // Parcial = amarillo
    'f': 'badge-success'   // Final = verde
  };
  return classes[tipo] || 'badge-neutral';
}

/**
 * Obtiene la clase CSS para el badge del status de ola
 */
export function getWaveStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    'p': 'badge-info',      // Planeada = azul
    'r': 'badge-warning',   // Reprogramada = amarillo
    'x': 'badge-error'      // Cancelada = rojo
  };
  return classes[status] || 'badge-neutral';
}

/**
 * Obtiene la clase CSS para el badge del status de línea
 */
export function getHarvestLineStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    'p': 'badge-warning',   // Pendiente = amarillo
    'c': 'badge-success',   // Confirmada = verde
    'x': 'badge-error'      // Cancelada = rojo
  };
  return classes[status] || 'badge-neutral';
}

/**
 * Calcula el porcentaje de completitud de una ola
 */
export function calculateWaveCompletion(wave: HarvestWaveWithItems): number {
  if (!wave.cosechas || wave.cosechas.length === 0) return 0;
  
  const confirmed = wave.cosechas.filter(h => h.status === 'c').length;
  return Math.round((confirmed / wave.cosechas.length) * 100);
}

/**
 * Calcula biomasa total confirmada de una ola
 */
export function calculateWaveBiomasa(wave: HarvestWaveWithItems): number {
  if (!wave.cosechas || wave.cosechas.length === 0) return 0;
  
  return wave.cosechas
    .filter(h => h.status === 'c' && h.biomasa_kg)
    .reduce((sum, h) => sum + (h.biomasa_kg || 0), 0);
}

/**
 * Obtiene el conteo de líneas por status
 */
export function getLineCountsByStatus(wave: HarvestWaveWithItems): WaveStats {
  const total_lines = wave.cosechas?.length || 0;
  const pending = wave.cosechas?.filter(h => h.status === 'p').length || 0;
  const confirmed = wave.cosechas?.filter(h => h.status === 'c').length || 0;
  const cancelled = wave.cosechas?.filter(h => h.status === 'x').length || 0;
  
  return {
    total_lines,
    pending_lines: pending,
    confirmed_lines: confirmed,
    cancelled_lines: cancelled,
    completion_percentage: total_lines > 0 ? Math.round((confirmed / total_lines) * 100) : 0,
    total_biomasa_confirmada_kg: calculateWaveBiomasa(wave)
  };
}

/**
 * Determina si una ola puede ser cancelada
 */
export function canCancelWave(wave: HarvestWave | HarvestWaveWithItems): boolean {
  // No se puede cancelar si ya está cancelada
  if (wave.status === 'x') return false;
  
  // Si es HarvestWaveWithItems, verificar que tenga líneas pendientes
  if ('cosechas' in wave) {
    const hasPendingLines = wave.cosechas.some(h => h.status === 'p');
    return hasPendingLines;
  }
  
  // Si solo es HarvestWave, asumimos que sí se puede cancelar
  return true;
}

/**
 * Determina si una línea puede ser reprogramada
 */
export function canReprogramLine(line: HarvestLine): boolean {
  // Solo se puede reprogramar si está pendiente
  return line.status === 'p';
}

/**
 * Determina si una línea puede ser confirmada
 */
export function canConfirmLine(line: HarvestLine): boolean {
  // Solo se puede confirmar si está pendiente
  return line.status === 'p';
}

/**
 * Formatea fecha para display
 */
export function formatHarvestDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formatea rango de fechas
 */
export function formatDateRange(inicio: string, fin: string): string {
  return `${formatHarvestDate(inicio)} - ${formatHarvestDate(fin)}`;
}

/**
 * Calcula días hasta/desde una fecha
 */
export function getDaysUntilDate(dateString: string): number {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado temporal de una ola (para badges)
 */
export function getWaveTemporalStatus(wave: HarvestWave): 'upcoming' | 'current' | 'past' | 'cancelled' {
  if (wave.status === 'x') return 'cancelled';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const inicio = new Date(wave.ventana_inicio);
  inicio.setHours(0, 0, 0, 0);
  
  const fin = new Date(wave.ventana_fin);
  fin.setHours(0, 0, 0, 0);
  
  if (today < inicio) return 'upcoming';
  if (today > fin) return 'past';
  return 'current';
}