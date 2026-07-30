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
  ) {}

  onLogin() {
    this.errorMsg = '';
    this.cargando = true;

    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      // Capturamos la respuesta (res) que envía el backend
      next: (res: any) => {
        this.cargando = false;
        
        // Extraemos el rol. Si por alguna razón no viene, asumimos cajero por seguridad.
        const rolUsuario = res?.usuario?.rol || 'cajero';

        // Redirección inteligente basada en el rol
        if (rolUsuario === 'admin') {
          this.router.navigate(['/home']); // El admin va a su panel de métricas/inventario
        } else {
          // El cajero va directo a la terminal de punto de venta
          // Nota: Asegúrate de tener la ruta '/ventas' habilitada en tus app.routes.ts
          this.router.navigate(['/home']); 
        }
      },
      error: () => {
        // Blindaje definitivo: detiene el loader de inmediato y muestra el mensaje sin depender de JSON alterados por antivirus.
        this.cargando = false;
        this.errorMsg = 'Usuario o contraseña incorrectos.';
      }
    });
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