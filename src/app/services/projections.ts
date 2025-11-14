import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Projection,
  ProjectionDetail,
  ProjectionFromFileResponse,
  ProjectionUpdate,
  ProjectionPublish
} from '../models/projection.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectionService {
  private readonly API_URL = `${environment.apiUrl}/projections`;

  constructor(private http: HttpClient) {}

  /**
   * Crear proyección desde archivo con IA (Gemini)
   * Endpoint: POST /projections/cycles/{ciclo_id}/from-file
   */
  createFromFile(
    cycleId: number,
    file: File,
    version?: string,
    descripcion?: string
  ): Observable<ProjectionFromFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();
    if (version) {
      params = params.set('version', version);
    }
    if (descripcion) {
      params = params.set('descripcion', descripcion);
    }

    return this.http.post<ProjectionFromFileResponse>(
      `${this.API_URL}/cycles/${cycleId}/from-file`,
      formData,
      { params }
    );
  }

  /**
   * Listar todas las proyecciones de un ciclo
   * Endpoint: GET /projections/cycles/{ciclo_id}
   */
  listByCycle(
    cycleId: number,
    includeCancelled: boolean = false
  ): Observable<Projection[]> {
    const params = new HttpParams().set('include_cancelled', includeCancelled.toString());
    return this.http.get<Projection[]>(
      `${this.API_URL}/cycles/${cycleId}`,
      { params }
    );
  }

  /**
   * Obtener proyección actual publicada (is_current=true)
   * Endpoint: GET /projections/cycles/{ciclo_id}/current
   */
  getCurrentProjection(cycleId: number): Observable<ProjectionDetail | null> {
    return this.http.get<ProjectionDetail | null>(
      `${this.API_URL}/cycles/${cycleId}/current`
    );
  }

  /**
   * Obtener borrador actual (status='b')
   * Endpoint: GET /projections/cycles/{ciclo_id}/draft
   */
  getDraftProjection(cycleId: number): Observable<ProjectionDetail | null> {
    return this.http.get<ProjectionDetail | null>(
      `${this.API_URL}/cycles/${cycleId}/draft`
    );
  }

  /**
   * Obtener proyección específica con líneas
   * Endpoint: GET /projections/{proyeccion_id}
   */
  getById(projectionId: number): Observable<ProjectionDetail> {
    return this.http.get<ProjectionDetail>(`${this.API_URL}/${projectionId}`);
  }

  /**
   * Actualizar metadatos de proyección (solo borradores)
   * Endpoint: PATCH /projections/{proyeccion_id}
   */
  update(
    projectionId: number,
    data: ProjectionUpdate
  ): Observable<Projection> {
    return this.http.patch<Projection>(`${this.API_URL}/${projectionId}`, data);
  }

  /**
   * Publicar proyección en borrador
   * Endpoint: POST /projections/{proyeccion_id}/publish
   */
  publish(projectionId: number): Observable<Projection> {
    const payload: ProjectionPublish = { confirmar_publicacion: true };
    return this.http.post<Projection>(
      `${this.API_URL}/${projectionId}/publish`,
      payload
    );
  }

  /**
   * Cancelar/archivar proyección
   * Endpoint: DELETE /projections/{proyeccion_id}
   */
  cancel(projectionId: number): Observable<Projection> {
    return this.http.delete<Projection>(`${this.API_URL}/${projectionId}`);
  }
}