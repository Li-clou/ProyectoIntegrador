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

  nombre: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
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

    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;

    this.authService.registrarCliente({
      nombre_us: this.nombre,
      ap_us: this.apellidoPaterno,
      am_us: this.apellidoMaterno,
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

  private validarFormulario(): boolean {
    if (!this.nombre || !this.apellidoPaterno || !this.usuario || !this.password) {
      this.errorMsg = 'Nombre, apellido paterno, usuario y contraseña son obligatorios';
      return false;
    }

    if (this.password !== this.confirmarPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  onIrALogin(): void {
    this.router.navigate(['/inicio-sesion']);
  }
}