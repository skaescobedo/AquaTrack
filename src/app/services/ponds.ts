import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pond, PondCreate, PondUpdate } from '../models/pond.model';

@Injectable({
  providedIn: 'root'
})
export class PondService {
  private readonly API_URL = `${environment.apiUrl}/ponds`;

  constructor(private http: HttpClient) {}

  /**
   * Listar estanques de una granja
   */
  getPonds(granjaId: number, vigentesOnly: boolean = false): Observable<Pond[]> {
    const params = new HttpParams().set('vigentes_only', vigentesOnly.toString());
    return this.http.get<Pond[]>(`${this.API_URL}/farms/${granjaId}`, { params });
  }

  /**
   * Obtener un estanque por ID
   */
  getPond(id: number): Observable<Pond> {
    return this.http.get<Pond>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo estanque
   */
  createPond(granjaId: number, data: PondCreate): Observable<Pond> {
    return this.http.post<Pond>(`${this.API_URL}/farms/${granjaId}`, data);
  }

  /**
   * Actualizar estanque
   */
  updatePond(id: number, data: PondUpdate): Observable<Pond> {
    return this.http.patch<Pond>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar estanque
   */
  deletePond(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}