import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CycleOverview, PondDetail } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener overview/analytics de un ciclo
   * Endpoint: GET /analytics/cycles/{ciclo_id}/overview
   */
  getCycleOverview(cicloId: number): Observable<CycleOverview> {
    return this.http.get<CycleOverview>(`${this.API_URL}/cycles/${cicloId}/overview`);
  }

  /**
   * Obtener dashboard detallado de un estanque
   * Endpoint: GET /analytics/ponds/{estanque_id}/detail?ciclo_id={ciclo_id}
   */
  getPondDetail(pondId: number, cycleId: number): Observable<PondDetail> {
    const params = new HttpParams().set('ciclo_id', cycleId.toString());
    return this.http.get<PondDetail>(`${this.API_URL}/ponds/${pondId}/detail`, { params });
  }
}