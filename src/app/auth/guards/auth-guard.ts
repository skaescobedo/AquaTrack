import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard verificando acceso a:', state.url);
  
  const isAuth = authService.isAuthenticated();
  console.log('🔐 Usuario autenticado:', isAuth);

  if (isAuth) {
    console.log('✅ Acceso permitido');
    return true;
  }

  console.log('❌ Acceso denegado, redirigiendo a login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};