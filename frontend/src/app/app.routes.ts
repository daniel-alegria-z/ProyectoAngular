import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Servicios } from './pages/servicios/servicios';
import { AuthGuard } from './auth-guard'; // importación para proteger las rutas

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'inicio', component: Inicio, canActivate: [AuthGuard] },      // <-- Protegida
  { path: 'servicios', component: Servicios, canActivate: [AuthGuard] } // <-- Protegida
];