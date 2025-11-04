import { Inicio } from './pages/inicio/inicio';
import { Servicios } from './pages/servicios/servicios';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { AuthGuard } from './auth-guard';
import { Routes } from '@angular/router';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
];

export const routes: Routes = [
  {
    path: 'inicio',
    component: Inicio,
    canActivate: [AuthGuard] // Protege la ruta de inicio
  },
  {
    path: 'servicios',
    component: Servicios,
    canActivate: [AuthGuard] // Protege la ruta de servicios
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  // Rutas públicas o protegidas según la app
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }, // Redirección por defecto
  { path: '**', redirectTo: 'inicio' } // Redirección para rutas no encontradas
];