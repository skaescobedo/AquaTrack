import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cycle, CycleCreate, CycleUpdate } from '../models/cycle.model';

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private readonly API_URL = `${environment.apiUrl}/cycles`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener ciclo activo de una granja
   * Endpoint: GET /cycles/farms/{granja_id}/active
   */
  getActiveCycle(granjaId: number): Observable<Cycle | null> {
    return this.http.get<Cycle | null>(`${this.API_URL}/farms/${granjaId}/active`);
  }

  /**
   * Obtener ciclo por ID
   */
  getCycle(id: number): Observable<Cycle> {
    return this.http.get<Cycle>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo ciclo
   */
  createCycle(data: CycleCreate): Observable<Cycle> {
    return this.http.post<Cycle>(this.API_URL, data);
  }

  /**
   * Actualizar ciclo
   */
  updateCycle(id: number, data: CycleUpdate): Observable<Cycle> {
    return this.http.patch<Cycle>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Finalizar ciclo
   */
  finalizeCycle(id: number): Observable<Cycle> {
    return this.http.post<Cycle>(`${this.API_URL}/${id}/finalize`, {});
  }
}