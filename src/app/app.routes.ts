import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models/user.model';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employee/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
      },
      {
        path: 'users',
        canActivate: [roleGuard([UserRole.Admin, UserRole.Manager])],
        loadChildren: () => import('./features/user/user.routes').then((m) => m.USER_ROUTES),
      },
      {
        path: 'departments',
        canActivate: [roleGuard([UserRole.Admin, UserRole.Manager])],
        loadChildren: () =>
          import('./features/department/department.routes').then((m) => m.DEPARTMENT_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./features/errors/unauthorized/unauthorized.component').then(
            (m) => m.UnauthorizedComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
