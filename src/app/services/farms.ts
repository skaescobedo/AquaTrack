import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Farm, FarmCreate, FarmUpdate } from '../models/farm.model';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private readonly API_URL = `${environment.apiUrl}/farms`;

  constructor(private http: HttpClient) {}

  getFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.API_URL);
  }

  getFarm(id: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.API_URL}/${id}`);
  }

  createFarm(data: FarmCreate): Observable<Farm> {
    return this.http.post<Farm>(this.API_URL, data);
  }

  updateFarm(id: number, data: FarmUpdate): Observable<Farm> {
    return this.http.put<Farm>(`${this.API_URL}/${id}`, data);
  }
}