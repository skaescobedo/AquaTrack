import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cycle, CycleCreate, CycleUpdate } from '../models/cycle.model';

export interface JobStatus {
  job_id: string;
  usuario_id: number;
  ciclo_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  proyeccion_id: number | null;
  error_detail: string | null;
  warnings: string[] | null;
  created_at: string;
  completed_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private readonly API_URL = `${environment.apiUrl}/cycles`;
  private readonly JOBS_URL = `${environment.apiUrl}/jobs`;

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
   * Crear nuevo ciclo (básico, sin archivo)
   */
  createCycle(data: CycleCreate): Observable<Cycle> {
    return this.http.post<Cycle>(this.API_URL, data);
  }

  /**
   * Crear nuevo ciclo con archivo de proyección (FormData)
   * Endpoint: POST /cycles/farms/{granja_id}
   * 
   * Ahora es ASÍNCRONO: retorna ciclo + job_id
   * Si hay job_id, usar getJobStatus() para polling
   */
  createCycleWithFile(granjaId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/farms/${granjaId}`, formData);
  }

  /**
   * Obtener estado de procesamiento de proyección
   * Endpoint: GET /jobs/{job_id}
   */
  getJobStatus(jobId: string): Observable<JobStatus> {
    return this.http.get<JobStatus>(`${this.JOBS_URL}/${jobId}`);
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