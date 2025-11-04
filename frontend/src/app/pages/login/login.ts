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

  loginSuccessMsg = '';

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
    if (!this.regUsername || !this.regEmail || !this.regPassword) {
      this.registroErrorMsg = 'Por favor, complete todos los campos.';
      this.registroErrorColor = '#148974';
      return;
    }

    this.auth.register(this.regUsername, this.regEmail, this.regPassword).subscribe({
      next: (res) => {
        // Cierra el modal de registro y abre el de éxito
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
        this.registroErrorMsg = err?.error?.msg || 'Error desconocido en el registro.';
        this.registroErrorColor = '#e74c3c';
        this.cdr.detectChanges();
      }
    });
  }

  abrirRegistroModal() {
    // Limpia el mensaje solo al abrir el modal, no los campos
    this.registroErrorMsg = '';
  }

  cerrarModales() {
    const exitoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroExitosoModal'));
    exitoModal.hide();
    const registroModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registroModal'));
    registroModal.hide();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['logout']) {
        this.loginSuccessMsg = 'Sesión cerrada correctamente';
        this.loginErrorMsg = '';
        this.loginErrorColor = '';
        setTimeout(() => this.loginSuccessMsg = '', 2500); // Oculta el mensaje tras 4s
      }
    });
  }
}

