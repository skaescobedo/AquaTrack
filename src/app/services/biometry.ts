import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Biometry,
  BiometryList,
  BiometryCreate,
  BiometryUpdate,
  BiometryCreateResponse,
  BiometryContext,
  SOBChangeLog
} from '../models/biometry.model';

@Injectable({
  providedIn: 'root'
})
export class BiometryService {
  private readonly API_URL = `${environment.apiUrl}/biometria`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener contexto para registrar biometría
   * Este endpoint debe llamarse ANTES de mostrar el formulario
   * Endpoint: GET /biometria/cycles/{ciclo_id}/ponds/{estanque_id}/context
   */
  getContext(cycleId: number, pondId: number): Observable<BiometryContext> {
    return this.http.get<BiometryContext>(
      `${this.API_URL}/cycles/${cycleId}/ponds/${pondId}/context`
    );
  }

  /**
   * Registrar nueva biometría
   * Endpoint: POST /biometria/cycles/{ciclo_id}/ponds/{estanque_id}
   */
  create(
    cycleId: number,
    pondId: number,
    data: BiometryCreate
  ): Observable<BiometryCreateResponse> {
    return this.http.post<BiometryCreateResponse>(
      `${this.API_URL}/cycles/${cycleId}/ponds/${pondId}`,
      data
    );
  }

  /**
   * Obtener historial de biometrías de un estanque
   * Endpoint: GET /biometria/cycles/{ciclo_id}/ponds/{estanque_id}
   */
  getHistory(
    cycleId: number,
    pondId: number,
    fechaDesde?: string,
    fechaHasta?: string,
    limit: number = 100,
    offset: number = 0
  ): Observable<BiometryList[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http.get<BiometryList[]>(
      `${this.API_URL}/cycles/${cycleId}/ponds/${pondId}`,
      { params }
    );
  }

  /**
   * Obtener historial de biometrías de todo el ciclo
   * Endpoint: GET /biometria/cycles/{ciclo_id}
   */
  getCycleHistory(
    cycleId: number,
    fechaDesde?: string,
    fechaHasta?: string,
    limit: number = 100,
    offset: number = 0
  ): Observable<BiometryList[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http.get<BiometryList[]>(
      `${this.API_URL}/cycles/${cycleId}`,
      { params }
    );
  }

  /**
   * Obtener biometría específica por ID
   * Endpoint: GET /biometria/{biometria_id}
   */
  getById(biometryId: number): Observable<Biometry> {
    return this.http.get<Biometry>(`${this.API_URL}/${biometryId}`);
  }

  /**
   * Actualizar biometría (solo notas)
   * Solo se permite si la biometría NO actualizó el SOB operativo
   * Endpoint: PATCH /biometria/{biometria_id}
   */
  update(biometryId: number, data: BiometryUpdate): Observable<Biometry> {
    return this.http.patch<Biometry>(`${this.API_URL}/${biometryId}`, data);
  }

  /**
   * Eliminar biometría
   * Solo se permite si NO actualizó el SOB operativo actual
   * Endpoint: DELETE /biometria/{biometria_id}
   */
  delete(biometryId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${biometryId}`);
  }

  /**
   * Obtener historial de cambios de SOB
   * Endpoint: GET /biometria/cycles/{ciclo_id}/ponds/{estanque_id}/sob-history
   */
  getSOBHistory(cycleId: number, pondId: number): Observable<SOBChangeLog[]> {
    return this.http.get<SOBChangeLog[]>(
      `${this.API_URL}/cycles/${cycleId}/ponds/${pondId}/sob-history`
    );
  }
}