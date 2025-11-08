import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth';
import { map, take } from 'rxjs/operators';

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
 * 
 * MEJORA: Ahora espera a que el usuario esté cargado antes de verificar permisos
 */
export const permissionsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredScope = route.data['requiredScope'] as string;
  const farmId = route.params['farmId'] ? parseInt(route.params['farmId']) : undefined;

  if (!requiredScope) {
    console.warn('⚠️ permissionsGuard: No se especificó requiredScope en route.data');
    return true;
  }

  // Obtener el usuario actual de forma síncrona desde el signal
  const user = authService.currentUser();
  
  // Si no hay usuario cargado, intentar cargarlo
  if (!user) {
    console.log('🔄 Usuario no cargado, esperando...');
    
    // Esperar a que se cargue el perfil
    return authService.loadUserProfile().pipe(
      take(1),
      map(loadedUser => {
        console.log('✅ Usuario cargado en permissionsGuard:', loadedUser.username);
        return checkPermission(loadedUser, requiredScope, farmId, router);
      })
    );
  }

  // Si ya hay usuario, verificar permisos directamente
  return checkPermission(user, requiredScope, farmId, router);
};

/**
 * Función auxiliar para verificar permisos
 */
function checkPermission(
  user: any,
  requiredScope: string,
  farmId: number | undefined,
  router: Router
): boolean {
  // ✅ PRIMERO: Verificar si es admin_global
  if (user.is_admin_global) {
    console.log('✅ Admin global - acceso total garantizado');
    return true;
  }

  // SEGUNDO: Verificar scopes en las granjas del usuario
  if (!farmId) {
    // Sin farmId, verificar si tiene el scope en alguna granja activa
    const hasScope = user.farms.some((farm: any) => 
      farm.is_active && farm.scopes.includes(requiredScope)
    );

    if (!hasScope) {
      console.warn(`❌ Acceso denegado: se requiere scope "${requiredScope}"`);
      router.navigate(['/farms']);
      return false;
    }

    console.log(`✅ Usuario tiene scope "${requiredScope}" en alguna granja`);
    return true;
  }

  // Con farmId, verificar scope en esa granja específica
  const farm = user.farms.find((f: any) => f.granja_id === farmId);
  
  if (!farm) {
    console.warn(`❌ Usuario no pertenece a la granja ${farmId}`);
    router.navigate(['/farms']);
    return false;
  }

  if (!farm.is_active) {
    console.warn(`❌ Usuario inactivo en granja ${farmId}`);
    router.navigate(['/farms']);
    return false;
  }

  if (!farm.scopes.includes(requiredScope)) {
    console.warn(`❌ Acceso denegado: se requiere scope "${requiredScope}" en granja ${farmId}`);
    console.warn('Scopes del usuario en esta granja:', farm.scopes);
    router.navigate(['/farms']);
    return false;
  }

  console.log(`✅ Usuario tiene scope "${requiredScope}" en granja ${farmId}`);
  return true;
}