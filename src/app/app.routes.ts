import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
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
    ]
  },

  {
    path: '**',
    redirectTo: 'farms'
  }
];