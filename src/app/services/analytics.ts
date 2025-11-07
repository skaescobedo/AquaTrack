import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CycleOverview } from '../models/analytics.model';

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
}