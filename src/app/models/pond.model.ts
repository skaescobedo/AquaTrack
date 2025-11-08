export interface Pond {
  estanque_id: number;
  granja_id: number;
  nombre: string;
  superficie_m2: string; // Viene como string del backend
  status: 'i' | 'a' | 'c' | 'm'; // inactivo, activo, cosecha, mantenimiento
  is_vigente: boolean;
  notas?: string | null;
}

export interface PondCreate {
  nombre: string;
  superficie_m2: number;
  is_vigente?: boolean;
}

export interface PondUpdate {
  nombre?: string;
  superficie_m2?: number;
  notas?: string;
  requires_new_version?: boolean;
}

// Helper para obtener el label del status
export function getPondStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'i': 'Inactivo',
    'a': 'Operativo',
    'c': 'En Cosecha',
    'm': 'Mantenimiento'
  };
  return labels[status] || status;
}

// Helper para obtener la clase de badge del status
export function getPondStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'i': 'badge-neutral',
    'a': 'badge-success',
    'c': 'badge-warning',
    'm': 'badge-info'
  };
  return classes[status] || 'badge-neutral';
}