import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  rol: 'admin' | 'cajero' | 'pendiente' = 'pendiente'; // Valor por defecto para el registro de clientes
  confirmarPassword: string = '';

  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;
  cargando: boolean = false;
  errorMsg: string = '';

  // Expresiones regulares reutilizables
  private readonly REGEX_SOLO_LETRAS = /^[A-Za-zÀ-ÿÑñ\s]+$/;
  private readonly REGEX_TELEFONO = /^[0-9]{10}$/;
  private readonly REGEX_DIRECCION = /^[A-Za-zÀ-ÿÑñ0-9\s#.,-]+$/;
  private readonly REGEX_USUARIO = /^[A-Za-z0-9_]+$/;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  // ===================== VALIDACIONES DE CONTRASEÑA =====================
  get cumpleLongitud(): boolean {
    return this.password.length >= 8 && this.password.length <= 10;
  }

  get cumpleMayuscula(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get cumpleNumero(): boolean {
    return /[0-9]/.test(this.password);
  }

  get cumpleSinSimbolos(): boolean {
    return this.password.length > 0 && /^[A-Za-z0-9]+$/.test(this.password);
  }

  get contrasenasCoinciden(): boolean {
    return this.confirmarPassword.length > 0 && this.password === this.confirmarPassword;
  }

  // ===================== VALIDACIONES DE CAMPOS =====================
  // Se muestran en rojo solo si el usuario ya escribió algo (para no
  // pintar el campo de error antes de que empiece a teclear)

  get nombreValido(): boolean {
    return this.nombre_us.length === 0 || this.REGEX_SOLO_LETRAS.test(this.nombre_us);
  }

  get apPaternoValido(): boolean {
    return this.ap_us.length === 0 || this.REGEX_SOLO_LETRAS.test(this.ap_us);
  }

  get amMaternoValido(): boolean {
    return this.am_us.length === 0 || this.REGEX_SOLO_LETRAS.test(this.am_us);
  }

  get telefonoValido(): boolean {
    return this.telefono.length === 0 || this.REGEX_TELEFONO.test(this.telefono);
  }

  get direccionValida(): boolean {
    return this.direccion.length === 0 || this.REGEX_DIRECCION.test(this.direccion);
  }

  get usuarioValido(): boolean {
    return (
      this.usuario.length === 0 ||
      (this.usuario.length >= 4 && this.REGEX_USUARIO.test(this.usuario))
    );
  }

  // ===================== VALIDACIÓN GENERAL AL ENVIAR =====================
  private validarFormulario(): string | null {
    if (!this.REGEX_SOLO_LETRAS.test(this.nombre_us)) {
      return 'El nombre solo puede contener letras';
    }
    if (!this.REGEX_SOLO_LETRAS.test(this.ap_us)) {
      return 'El apellido paterno solo puede contener letras';
    }
    if (this.am_us && !this.REGEX_SOLO_LETRAS.test(this.am_us)) {
      return 'El apellido materno solo puede contener letras';
    }
    if (this.telefono && !this.REGEX_TELEFONO.test(this.telefono)) {
      return 'El teléfono debe tener exactamente 10 dígitos numéricos';
    }
    if (this.direccion && !this.REGEX_DIRECCION.test(this.direccion)) {
      return 'La dirección contiene caracteres no permitidos';
    }
    if (!this.usuarioValido) {
      return 'El usuario debe tener al menos 4 caracteres, solo letras, números y guion bajo';
    }
    if (!this.cumpleLongitud) {
      return 'La contraseña debe tener entre 8 y 10 caracteres';
    }
    if (!this.cumpleMayuscula) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!this.cumpleNumero) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!this.cumpleSinSimbolos) {
      return 'La contraseña no puede contener símbolos especiales';
    }
    if (this.password !== this.confirmarPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  onRegistrar(): void {
    this.errorMsg = '';

    const error = this.validarFormulario();
    if (error) {
      this.errorMsg = error;
      return;
    }

    this.cargando = true;

    this.authService
      .registrarCliente({
        nombre_us: this.nombre_us,
        ap_us: this.ap_us,
        am_us: this.am_us,
        direccion: this.direccion,
        telefono: this.telefono,
        usuario: this.usuario,
        password: this.password,
        rol: this.rol,
      })
      .subscribe({
        next: () => {
          this.cargando = false;

          Swal.fire({
            icon: 'success',
            title: '¡Cuenta creada!',
            text: 'Tu cuenta se registró correctamente. Ahora un administrador debe asignarte un rol antes de que puedas iniciar sesión.',
            confirmButtonColor: '#4A3B32',
          }).then(() => {
            this.router.navigate(['/inicio-sesion']);
          });
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.error || 'Ocurrió un error al registrar, intenta de nuevo';
        },
      });
  }

  onVolverLogin(): void {
    this.router.navigate(['/inicio-sesion']);
  }
}
