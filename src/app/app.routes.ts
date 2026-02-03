import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AppShell } from './app-shell/app-shell';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'app',
    component: AppShell,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      {
        path: 'users',
        children: [
          { path: '', loadComponent: () => import('./users/list/list').then(m => m.List) },
          { path: 'new', loadComponent: () => import('./users/form/form').then(m => m.Form), canActivate: [RoleGuard] },
          { path: ':id', loadComponent: () => import('./users/detail/detail').then(m => m.Detail) },
          { path: ':id/edit', loadComponent: () => import('./users/form/form').then(m => m.Form), canActivate: [RoleGuard] }
        ]
      },
      {
        path: 'bookings',
        children: [
          { path: '', loadComponent: () => import('./bookings/list/list').then(m => m.List) },
          { path: 'new', loadComponent: () => import('./bookings/form/form').then(m => m.Form), canActivate: [RoleGuard] },
          { path: ':id', loadComponent: () => import('./bookings/detail/detail').then(m => m.Detail) },
          { path: ':id/edit', loadComponent: () => import('./bookings/form/form').then(m => m.Form), canActivate: [RoleGuard] }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
