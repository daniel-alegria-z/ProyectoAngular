import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  loginErrorMsg = '';
  loginErrorColor = '';

  // Variables para el registro
  regUsername = '';
  regEmail = '';
  regPassword = '';
  registroErrorMsg = '';
  registroErrorColor = '';

  // Activa validación visual tras intentar registrarse
  regValidationActive = false;

  loginSuccessMsg = '';

  passwordVisible = false;      // para login
  regPasswordVisible = false;   // para registro

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute) { }

  onLogin() {
    // Validación manual de campos vacíos
    if (!this.username || !this.password) {
      this.loginErrorMsg = 'Por favor, complete todos los campos.';
      this.loginErrorColor = '#1A9440';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        // Guarda el token y redirige
        localStorage.setItem('token', res.access_token);
        this.router.navigate(['/inicio']); // Redirige a la página de inicio
      },
      error: (err) => {
        this.loginErrorMsg = err.error.msg || 'Error al iniciar sesión.';
        this.loginErrorColor = '#e74c3c';
        this.cdr.detectChanges(); // asegura render para mostrar mensaje de error
      }
    });
  }


  onRegister() {
    this.registroErrorMsg = '';
    this.registroErrorColor = '';
    this.regValidationActive = false; // NO mostrar sugerencias aún

    // 1) Comprobar campos vacíos
    if (!this.regUsername || !this.regEmail || !this.regPassword) {
      this.registroErrorMsg = 'Por favor, complete todos los campos.';
      this.registroErrorColor = '#e74c3c';
      this.cdr.detectChanges();
      return;
    }

    // 2) Validación de contraseña en cliente (prioritaria antes de enviar al servidor)
    const missing = this.validarContrasena(this.regPassword);
    if (missing.length) {
      this.regValidationActive = true;
      this.registroErrorColor = '#e74c3c';
      this.cdr.detectChanges();
      return;
    }

    // 3) Enviar petición de registro al servidor (ahora la contraseña ya es válida)
    this.auth.register(this.regUsername, this.regEmail, this.regPassword).subscribe({
      next: (res) => {
        // Registro exitoso: limpiar estados y mostrar modal de éxito
        this.regValidationActive = false;
        const registroModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroModal'));
        registroModal.hide();
        const exitoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroExitosoModal'));
        exitoModal.show();
        // Limpia los campos tras éxito en el registro
        this.regUsername = '';
        this.regEmail = '';
        this.regPassword = '';
        this.registroErrorMsg = '';
      },
      error: (err) => {
        const serverMsg = err?.error?.msg || err?.message || '';
        // Fallback: mostrar mensaje del servidor si no encaja en los anteriores
        this.registroErrorMsg = serverMsg || 'Error desconocido en el registro.';
        this.registroErrorColor = '#e74c3c';
        this.cdr.detectChanges();
      }
    });
  }

  // devuelve estado de cada requisito (para la vista)
  requisitosContrasena(password: string) {
    return [
      { key: 'length', valid: password?.length >= 8, msg: 'mínimo 8 caracteres' },
      { key: 'upper', valid: /[A-Z]/.test(password || ''), msg: 'al menos una letra mayúscula' },
      { key: 'lower', valid: /[a-z]/.test(password || ''), msg: 'al menos una letra minúscula' },
      { key: 'digit', valid: /[0-9]/.test(password || ''), msg: 'al menos un número' },
      { key: 'special', valid: /[!@#\$%\^&\*\(\)\-\_\=\+\[\]\{\};:'",<\.>\/\?\\|`~\.#]/.test(password || ''), msg: 'al menos un carácter especial (ej: ., #, !, @)' },
      { key: 'nospace', valid: !/\s/.test(password || ''), msg: 'sin espacios' },
    ];
  }

  tieneRequisitosIncompletos(password: string): boolean {
    return this.requisitosContrasena(password).some(r => !r.valid);
  }

  validarContrasena(password: string): string[] {
    return this.requisitosContrasena(password).filter(r => !r.valid).map(r => r.msg);
  }

  formatodeContrasena(missing: string[]): string {
    if (!missing.length) return '';
    if (missing.length === 1) return `La contraseña debe contener ${missing[0]}.`;
    const last = missing.pop();
    return `La contraseña debe contener ${missing.join(', ')} y ${last}.`;
  }

  // alterna visibilidad del input de login
  toggleContrasenaVisible() {
    this.passwordVisible = !this.passwordVisible;
  }

  // alterna visibilidad del input de registro
  toggleRegContrasenaVisible() {
    this.regPasswordVisible = !this.regPasswordVisible;
  }


  abrirRegistroModal() {
    this.registroErrorMsg = '';
    this.registroErrorColor = '';
    this.regValidationActive = false;
  }

  cerrarModales() {
    const exitoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroExitosoModal'));
    exitoModal.hide();
    const registroModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroModal'));
    registroModal.hide();
  }

  // ...existing code...
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['logout']) {
        this.loginSuccessMsg = 'Sesión cerrada correctamente';
        this.loginErrorMsg = '';
        this.loginErrorColor = '';
        setTimeout(() => this.loginSuccessMsg = '', 2500);
      }
    });

    
    if (typeof document !== 'undefined') {
      const registroEl = document.getElementById('registroModal');
      if (registroEl) {
        registroEl.addEventListener('hidden.bs.modal', () => {
          this.regUsername = '';
          this.regEmail = '';
          this.regPassword = '';
          this.registroErrorMsg = '';
          this.registroErrorColor = '';
          this.regValidationActive = false;
          this.regPasswordVisible = false;
          this.cdr.detectChanges();
        });
      }
    }
  }
}



