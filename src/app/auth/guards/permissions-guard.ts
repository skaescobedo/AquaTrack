import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Guard para proteger rutas que requieren permisos específicos
 * 
 * Uso en rutas:
 * {
 *   path: 'analytics',
 *   component: DashboardComponent,
 *   canActivate: [authGuard, permissionsGuard],
 *   data: { requiredScope: 'ver_analytics' }
 * }
 */
export const permissionsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredScope = route.data['requiredScope'] as string;
  const farmId = route.params['farmId'] ? parseInt(route.params['farmId']) : undefined;

  if (!requiredScope) {
    console.warn('permissionsGuard: No se especificó requiredScope en route.data');
    return true;
  }

  if (authService.hasPermission(requiredScope, farmId)) {
    return true;
  }

  // Sin permisos - redirigir a página de acceso denegado o farms
  console.warn(`Acceso denegado: se requiere scope "${requiredScope}"`);
  router.navigate(['/farms']);
  return false;
};