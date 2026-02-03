import { Routes } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';

export const APP_SHELL_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'users', loadChildren: () => import('../users/users.routes').then(m => m.USERS_ROUTES) },
  { path: 'bookings', loadChildren: () => import('../bookings/bookings.routes').then(m => m.BOOKINGS_ROUTES) }
];