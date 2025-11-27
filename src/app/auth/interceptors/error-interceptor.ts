import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      switch (error.status) {
        case 401:
          // Token inválido o expirado - redirigir a login
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // ✅ Limpiar token directamente sin usar AuthService
          localStorage.removeItem('aquatrack_token');
          router.navigate(['/login']);
          break;
        
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        
        case 409:
          errorMessage = error.error?.message || 'Conflicto - La operación no está permitida.';
          break;
        
        case 422:
          errorMessage = error.error?.detail || 'Datos inválidos.';
          break;
        
        case 500:
          errorMessage = 'Error del servidor. Intenta más tarde.';
          break;
        
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.detail) {
            errorMessage = error.error.detail;
          }
      }

      console.error('HTTP Error:', error);

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};