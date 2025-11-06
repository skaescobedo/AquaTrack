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
    ]
  },

  {
    path: '**',
    redirectTo: 'farms'
  }
];