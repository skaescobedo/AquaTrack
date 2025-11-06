import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserOut, UserCreate, UserUpdate, ChangePassword, AssignUserToFarm, UserFarm } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(granjaId?: number, status?: string, search?: string): Observable<UserOut[]> {
    let params = new HttpParams();
    if (granjaId) params = params.set('granja_id', granjaId);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    
    return this.http.get<UserOut[]>(this.API_URL, { params });
  }

  getUser(id: number): Observable<UserOut> {
    return this.http.get<UserOut>(`${this.API_URL}/${id}`);
  }

  createUser(data: UserCreate): Observable<UserOut> {
    return this.http.post<UserOut>(this.API_URL, data);
  }

  updateUser(id: number, data: UserUpdate): Observable<UserOut> {
    return this.http.patch<UserOut>(`${this.API_URL}/${id}`, data);
  }

  changePassword(id: number, data: ChangePassword): Observable<UserOut> {
    return this.http.patch<UserOut>(`${this.API_URL}/${id}/password`, data);
  }

  deactivateUser(id: number): Observable<UserOut> {
    return this.http.delete<UserOut>(`${this.API_URL}/${id}`);
  }

  assignToFarm(userId: number, data: AssignUserToFarm): Observable<any> {
    return this.http.post(`${this.API_URL}/${userId}/farms`, data);
  }

  removeFromFarm(userId: number, farmId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${userId}/farms/${farmId}`);
  }

  getUserFarms(userId: number): Observable<UserFarm[]> {
    return this.http.get<UserFarm[]>(`${this.API_URL}/${userId}/farms`);
  }
}