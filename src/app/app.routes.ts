import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { permissionsGuard } from './auth/guards/permissions-guard';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'farms',
        pathMatch: 'full'
      },
      {
        path: 'farms',
        loadComponent: () => import('./pages/farms/farms').then(m => m.Farms)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.Users)
      },
    ]
  },

  {
    path: 'farms/:farmId',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/farm-layout').then(m => m.FarmLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/cycle-dashboard/cycle-dashboard').then(m => m.CycleDashboard)
      },
      {
        path: 'ponds',
        loadComponent: () => import('./pages/ponds/ponds').then(m => m.Ponds)
      },
      {
        path: 'ponds/:pondId/dashboard',
        loadComponent: () => import('./pages/dashboard/pond-dashboard/pond-dashboard').then(m => m.PondDashboard),
        canActivate: [permissionsGuard],
        data: { requiredScope: 'ver_analytics' }
      },
      {
        path: 'seedings',
        loadComponent: () => import('./pages/seeding/seeding').then(m => m.SeedingPage)
      },
      {
        path: 'biometrics',
        loadComponent: () => import('./pages/biometry/biometry').then(m => m.Biometry)
      },
      // ✅ RUTAS DIRECTAS DE HARVEST (sin children wrapper)
      {
        path: 'harvests',
        redirectTo: 'harvest',
        pathMatch: 'full'
      },
      {
        path: 'harvest',
        loadComponent: () => import('./pages/harvest/harvest').then(m => m.HarvestPage),
        data: { title: 'Cosechas' }
      },
      {
        path: 'harvest/wave/:waveId',
        loadComponent: () => import('./pages/harvest/wave-detail/wave-detail').then(m => m.WaveDetailPage),
        data: { title: 'Detalle de Ola' }
      },
      {
        path: 'projections',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/projections/projections').then(m => m.Projections)
          },
          {
            path: ':projectionId',
            loadComponent: () => import('./pages/projections/projection-detail/projection-detail').then(m => m.ProjectionDetailComponent)
          }
        ]
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then(m => m.Reports)
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/history/history').then(m => m.History)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks').then(m => m.Tasks)
      },
    ]
  },

  {
    path: '**',
    redirectTo: 'farms'
  }
];