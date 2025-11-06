export interface Farm {
  granja_id: number;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  superficie_total_m2: number;
  is_active: boolean;
}

export interface FarmCreate {
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  superficie_total_m2: number;
  estanques?: PondCreate[];
}

export interface FarmUpdate {
  nombre?: string;
  ubicacion?: string;
  descripcion?: string;
  superficie_total_m2?: number;
  is_active?: boolean;
}

export interface PondCreate {
  nombre: string;
  superficie_m2?: number;
}