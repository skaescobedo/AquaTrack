import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HarvestWave,
  HarvestWaveWithItems,
  HarvestLine,
  HarvestWaveCreate,
  HarvestReprogram,
  HarvestConfirm
} from '../models/harvest.model';

@Injectable({
  providedIn: 'root'
})
export class HarvestService {
  private readonly API_URL = `${environment.apiUrl}/harvest`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // WAVE-LEVEL OPERATIONS
  // ==========================================

  /**
   * Crear ola de cosecha
   * POST /harvest/cycles/{ciclo_id}/wave
   * 
   * Crea una nueva ola y genera automáticamente líneas para todos los estanques
   * del plan de siembras del ciclo.
   * 
   * @param cycleId - ID del ciclo
   * @param data - Datos de la ola a crear
   * @returns Observable<HarvestWave>
   */
  createWave(cycleId: number, data: HarvestWaveCreate): Observable<HarvestWave> {
    return this.http.post<HarvestWave>(
      `${this.API_URL}/cycles/${cycleId}/wave`,
      data
    );
  }

  /**
   * Listar olas de cosecha de un ciclo
   * GET /harvest/cycles/{ciclo_id}/waves
   * 
   * Retorna todas las olas (sin líneas) ordenadas por orden y fecha de creación.
   * 
   * @param cycleId - ID del ciclo
   * @returns Observable<HarvestWave[]>
   */
  getWaves(cycleId: number): Observable<HarvestWave[]> {
    return this.http.get<HarvestWave[]>(
      `${this.API_URL}/cycles/${cycleId}/waves`
    );
  }

  /**
   * Obtener detalle de ola con todas sus líneas
   * GET /harvest/waves/{cosecha_ola_id}
   * 
   * Retorna la ola con todas sus líneas de cosecha (cosechas_estanque).
   * 
   * @param waveId - ID de la ola
   * @returns Observable<HarvestWaveWithItems>
   */
  getWaveWithItems(waveId: number): Observable<HarvestWaveWithItems> {
    return this.http.get<HarvestWaveWithItems>(
      `${this.API_URL}/waves/${waveId}`
    );
  }

  /**
   * Cancelar ola completa
   * POST /harvest/waves/{cosecha_ola_id}/cancel
   * 
   * Cancela la ola y todas sus líneas pendientes.
   * Las líneas ya confirmadas NO se afectan.
   * 
   * @param waveId - ID de la ola a cancelar
   * @returns Observable<any>
   */
  cancelWave(waveId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/waves/${waveId}/cancel`,
      {}
    );
  }

  // ==========================================
  // LINE-LEVEL OPERATIONS
  // ==========================================

  /**
   * Reprogramar fecha de una línea de cosecha
   * POST /harvest/harvests/{cosecha_estanque_id}/reprogram
   * 
   * Cambia la fecha de cosecha y registra el motivo.
   * Si la ola estaba en 'p', la marca como 'r' (reprogramada).
   * Dispara trigger de reforecast automáticamente.
   * 
   * @param harvestId - ID de la línea de cosecha
   * @param data - Nueva fecha y motivo
   * @returns Observable<HarvestLine>
   */
  reprogramHarvest(harvestId: number, data: HarvestReprogram): Observable<HarvestLine> {
    return this.http.post<HarvestLine>(
      `${this.API_URL}/harvests/${harvestId}/reprogram`,
      data
    );
  }

  /**
   * Confirmar cosecha con datos reales
   * POST /harvest/harvests/{cosecha_estanque_id}/confirm
   * 
   * Confirma la cosecha (operación crítica):
   * 1. Obtiene PP de la última biometría
   * 2. Si envías biomasa_kg → deriva densidad_retirada_org_m2
   * 3. Si envías densidad_retirada_org_m2 → deriva biomasa_kg
   * 4. Actualiza SOB operativo del estanque
   * 5. Marca status='c' (confirmada)
   * 6. Dispara trigger de reforecast automáticamente
   * 
   * IMPORTANTE: Debes proveer UNO de: biomasa_kg o densidad_retirada_org_m2
   * 
   * @param harvestId - ID de la línea de cosecha
   * @param data - Biomasa o densidad retirada
   * @returns Observable<HarvestLine>
   */
  confirmHarvest(harvestId: number, data: HarvestConfirm): Observable<HarvestLine> {
    return this.http.post<HarvestLine>(
      `${this.API_URL}/harvests/${harvestId}/confirm`,
      data
    );
  }

  // ==========================================
  // HELPER METHODS (opcional, para cálculos locales)
  // ==========================================

  /**
   * Calcula biomasa estimada basada en densidad y PP
   * Formula: biomasa_kg = (densidad × area × pp_g) / 1000
   * 
   * @param densidad - Densidad en org/m²
   * @param area - Área del estanque en m²
   * @param pp - Peso promedio en gramos
   * @returns Biomasa estimada en kg
   */
  calculateBiomasa(densidad: number, area: number, pp: number): number {
    return (densidad * area * pp) / 1000;
  }

  /**
   * Calcula densidad basada en biomasa y PP
   * Formula: densidad = (biomasa_kg × 1000) / (pp_g × area_m2)
   * 
   * @param biomasa - Biomasa en kg
   * @param area - Área del estanque en m²
   * @param pp - Peso promedio en gramos
   * @returns Densidad en org/m²
   */
  calculateDensidad(biomasa: number, area: number, pp: number): number {
    if (pp <= 0 || area <= 0) return 0;
    return (biomasa * 1000) / (pp * area);
  }

  /**
   * Valida datos de confirmación antes de enviar
   * 
   * @param data - Datos de confirmación
   * @returns true si es válido, string con error si no
   */
  validateConfirmData(data: HarvestConfirm): true | string {
    // Debe tener al menos uno
    if (!data.biomasa_kg && !data.densidad_retirada_org_m2) {
      return 'Debes proporcionar biomasa_kg o densidad_retirada_org_m2';
    }

    // No debe tener ambos
    if (data.biomasa_kg && data.densidad_retirada_org_m2) {
      return 'Solo puedes proporcionar biomasa_kg O densidad_retirada_org_m2, no ambos';
    }

    // Validar que sean positivos
    if (data.biomasa_kg !== undefined && data.biomasa_kg <= 0) {
      return 'La biomasa debe ser mayor a 0';
    }

    if (data.densidad_retirada_org_m2 !== undefined && data.densidad_retirada_org_m2 <= 0) {
      return 'La densidad debe ser mayor a 0';
    }

    return true;
  }
}