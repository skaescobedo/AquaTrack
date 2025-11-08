import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para agregar token JWT a las peticiones
 * 
 * IMPORTANTE: No inyectar AuthService aquí para evitar dependencia circular
 * El AuthService hace peticiones HTTP que activarían este interceptor
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Acceder directamente a localStorage sin usar AuthService
  const token = localStorage.getItem('aquatrack_token');

  // No agregar token a peticiones de login
  if (req.url.includes('/auth/token')) {
    return next(req);
  }

  // Si hay token, clonar request y agregar header Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};