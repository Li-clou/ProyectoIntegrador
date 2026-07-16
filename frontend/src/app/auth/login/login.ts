import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {

  usuario = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '817104761761-p7jprcba0qbqfta6fc9b57r2926nvltc.apps.googleusercontent.com',
      callback: (response: any) => this.zone.run(() => this.onGoogleResponse(response))
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large', width: 320 }
    );
  }

  onGoogleResponse(response: any) {
    this.errorMsg = '';
    this.cargando = true;

    this.authService.loginConGoogle(response.credential).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'No se pudo iniciar sesión con Google';
      }
    });
  }

  onLogin() {
    this.errorMsg = '';

    if (!this.usuario || !this.password) {
      this.errorMsg = 'Usuario y contraseña son obligatorios';
      return;
    }

    this.cargando = true;

    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Credenciales inválidas';
      }
    });
  }

  onRegistrarme() {
    this.router.navigate(['/registro']);
  }
}