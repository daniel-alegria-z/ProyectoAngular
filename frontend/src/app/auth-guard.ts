import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


// Función para verificar si el token JWT está expirado
function isTokenExpired(token: string): boolean {
  try {
    // Decodifica el payload del JWT (segunda parte del token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Obtiene el tiempo actual en segundos
    const now = Math.floor(Date.now() / 1000);
    // Retorna true si el token ya expiró
    return payload.exp < now;
  } catch {
    // Si ocurre un error al decodificar, considera el token como expirado
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // Solo ejecuta la lógica si es navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        return true;
      }
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
    // En el servidor, permite el acceso (o puedes bloquearlo según tu lógica)
    return true;
  }
}