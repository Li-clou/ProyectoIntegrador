import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  usuario = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  onLogin() {
    this.errorMsg = '';
    this.cargando = true;

    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      next: (res: any) => {
        this.cargando = false;
        const rolUsuario = res?.usuario?.rol || 'cajero';

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Iniciaste sesión correctamente',
          confirmButtonColor: '#4A3B32',
          timer: 1800,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-3xl'
          }
        }).then(() => {
          if (rolUsuario === 'admin') {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/home']);
          }
        });
      },
      error: (err: any) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Usuario o contraseña incorrectos.';
      }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  async recuperarPassword() {
    const { value: email } = await Swal.fire({
      title: 'Recuperar contraseña',
      text: 'Ingresa el correo electrónico asociado a tu cuenta para enviarte las instrucciones.',
      input: 'email',
      inputPlaceholder: 'ejemplo@kunibo.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar enlace',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3B32',
      cancelButtonColor: '#94a3b8',
      inputValidator: (value) => {
        if (!value) {
          return 'Necesitas ingresar un correo electrónico';
        }
        return null;
      }
    });

    if (email) {
      Swal.fire({
        icon: 'success',
        title: '¡Correo enviado!',
        text: `Si el correo ${email} está registrado, recibirás un enlace de recuperación pronto.`,
        confirmButtonColor: '#4A3B32'
      });
    }
  }
}