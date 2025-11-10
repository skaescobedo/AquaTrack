import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SeedingPlan,
  SeedingPlanWithItems,
  SeedingPlanCreate,
  Seeding,
  SeedingCreateForPond,
  SeedingReprogram
} from '../models/seeding.model';

@Injectable({
  providedIn: 'root'
})
export class SeedingService {
  private readonly API_URL = `${environment.apiUrl}/seeding`;

  constructor(private http: HttpClient) {}

  // Crear plan de siembras
  createPlan(cycleId: number, data: SeedingPlanCreate): Observable<SeedingPlan> {
    return this.http.post<SeedingPlan>(`${this.API_URL}/cycles/${cycleId}/plan`, data);
  }

  // Obtener plan de siembras con sus siembras
  getPlan(cycleId: number): Observable<SeedingPlanWithItems> {
    return this.http.get<SeedingPlanWithItems>(`${this.API_URL}/cycles/${cycleId}/plan`);
  }

  // Crear siembra manual para estanque
  createManualSeeding(
    planId: number,
    pondId: number,
    data: SeedingCreateForPond
  ): Observable<Seeding> {
    return this.http.post<Seeding>(`${this.API_URL}/plans/${planId}/ponds/${pondId}`, data);
  }

  // Reprogramar siembra
  reprogramSeeding(seedingId: number, data: SeedingReprogram): Observable<Seeding> {
    return this.http.patch<Seeding>(`${this.API_URL}/seedings/${seedingId}/reprogram`, data);
  }

  // Confirmar siembra
  confirmSeeding(seedingId: number): Observable<Seeding> {
    return this.http.post<Seeding>(`${this.API_URL}/seedings/${seedingId}/confirm`, {});
  }

  // Eliminar plan (solo si no tiene siembras confirmadas)
  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/plans/${planId}`);
  }
}