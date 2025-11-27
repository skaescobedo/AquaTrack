import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  User, 
  LoginCredentials, 
  Token, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  PasswordResetResponse 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'aquatrack_token';
  private readonly API_URL = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticatedSignal = signal<boolean>(false);
  private profileLoadAttempted = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 AuthService inicializado');
    this.checkAuthStatus();
  }

  /**
   * Login con username y password
   */
  login(credentials: LoginCredentials): Observable<Token> {
    console.log('📤 Enviando petición de login a:', `${this.API_URL}/token`);
    
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<Token>(
      `${this.API_URL}/token`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).pipe(
      tap(response => {
        console.log('✅ Token recibido');
        this.setToken(response.access_token);
        console.log('💾 Token guardado en localStorage');
        
        // Cargar perfil del usuario
        this.loadUserProfile().subscribe({
          next: (user) => {
            console.log('👤 Perfil de usuario cargado:', user.username);
          },
          error: (err) => {
            console.error('❌ Error cargando perfil:', err);
          }
        });
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  

  /**
   * Obtener perfil del usuario actual
   */
  loadUserProfile(): Observable<User> {
    console.log('📤 Cargando perfil de usuario...');
    
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        console.log('✅ Perfil cargado:', user);
        this.currentUser.set(user);
        this.isAuthenticatedSignal.set(true);
        this.profileLoadAttempted = true;
      }),
      catchError(error => {
        this.profileLoadAttempted = true;
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.removeToken();
    this.currentUser.set(null);
    this.isAuthenticatedSignal.set(false);
    this.profileLoadAttempted = false;
    this.router.navigate(['/login']);
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('🔍 Verificando autenticación:', hasToken);
    return hasToken;
  }

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(payload: ForgotPasswordRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.API_URL}/forgot-password`,
      payload
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.API_URL}/reset-password`,
      payload
    );
  }

  /**
   * Guardar token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Eliminar token de localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Verificar si hay sesión activa al iniciar la app
   * MEJORADO: Solo limpia sesión si es error 401/403 (token inválido)
   * Para otros errores, mantiene el token y el usuario puede reintentar
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    console.log('🔍 Verificando estado de autenticación inicial:', !!token);
    
    if (token) {
      // Marcar como autenticado basado en el token
      // Esto permite que el guard deje pasar
      this.isAuthenticatedSignal.set(true);
      
      // Intentar cargar el perfil
      this.loadUserProfile().subscribe({
        next: (user) => {
          console.log('✅ Sesión restaurada para:', user.username);
        },
        error: (err) => {
          console.error('❌ Error restaurando sesión:', err);
          
          // CRÍTICO: Solo cerrar sesión si es error de autenticación
          if (err.status === 401 || err.status === 403) {
            console.warn('⚠️ Token inválido o expirado, cerrando sesión');
            this.removeToken();
            this.currentUser.set(null);
            this.isAuthenticatedSignal.set(false);
            // No redirigir aquí, dejar que el guard lo maneje
          } else {
            // Para otros errores (red, servidor, etc.)
            // Mantener el token y la señal de autenticación
            // El usuario podrá ver la app y los componentes pueden reintentar
            console.warn('⚠️ Error de red/servidor, manteniendo sesión. Código:', err.status);
            // NO establecer currentUser, los componentes deben manejar este caso
          }
        }
      });
    } else {
      console.log('ℹ️ No hay token guardado');
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(scope: string, farmId?: number): boolean {
    const user = this.currentUser();
    
    if (!user) return false;
    if (user.is_admin_global) return true;
    
    if (!farmId) {
      return user.farms.some(farm => 
        farm.is_active && farm.scopes.includes(scope)
      );
    }
    
    const farm = user.farms.find(f => f.granja_id === farmId);
    return farm ? farm.is_active && farm.scopes.includes(scope) : false;
  }

  /**
   * Verificar si el usuario pertenece a una granja
   */
  isMemberOfFarm(farmId: number): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.is_admin_global) return true;
    
    return user.farms.some(f => 
      f.granja_id === farmId && f.is_active
    );
  }

  /**
   * Obtener rol del usuario en una granja
   */
  getRoleInFarm(farmId: number): string | null {
    const user = this.currentUser();
    if (!user) return null;
    if (user.is_admin_global) return 'admin_global';
    
    const farm = user.farms.find(f => f.granja_id === farmId);
    return farm?.rol || null;
  }

  /**
   * Verificar si el perfil del usuario ya se intentó cargar
   */
  get hasAttemptedProfileLoad(): boolean {
    return this.profileLoadAttempted;
  }

  /**
   * Forzar recarga del perfil (útil para cuando hay error de red temporal)
   */
  retryLoadProfile(): Observable<User> {
    return this.loadUserProfile();
  }
}