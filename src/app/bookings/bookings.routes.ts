import { Routes } from '@angular/router';
import { List } from './list/list';
import { Form } from './form/form';
import { Detail } from './detail/detail';
import { RoleGuard } from '../guards/role.guard';

export const BOOKINGS_ROUTES: Routes = [
  { path: '', component: List },
  { path: 'new', component: Form, canActivate: [RoleGuard] },
  { path: ':id/view', component: Detail },
  { path: ':id/edit', component: Form, canActivate: [RoleGuard] }
];