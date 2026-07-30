import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
})
export class RegistroCliente {

  nombre_us: string = '';
  ap_us: string = '';
  am_us: string = '';
  direccion: string = '';
  telefono: string = '';
  usuario: string = '';
  password: string = '';
  confirmarPassword: string = '';

  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;
  cargando: boolean = false;
  errorMsg: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegistrar(): void {
    this.errorMsg = '';

    // Validamos únicamente si las contraseñas coinciden
    if (this.password !== this.confirmarPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;

    this.authService.registrarCliente({
      nombre_us: this.nombre_us,
      ap_us: this.ap_us,
      am_us: this.am_us,
      direccion: this.direccion,
      telefono: this.telefono,
      usuario: this.usuario,
      password: this.password
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/inicio-sesion']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Ocurrió un error al registrar, intenta de nuevo';
      }
    });
  }

  onVolverLogin(): void {
    this.router.navigate(['/inicio-sesion']);
  }
}