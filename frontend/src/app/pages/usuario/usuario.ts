import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario, Rol } from '../../models/usuario.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  cargando = false;
  errorMsg = '';

  busqueda = '';
  filtroRol: 'Todos' | 'admin' | 'cajero' | 'pendiente' = 'Todos';
  
  // ===== NUEVA PROPIEDAD AGREGADA =====
  filtros: ('Todos' | 'admin' | 'cajero' | 'pendiente')[] = ['Todos', 'admin', 'cajero', 'pendiente'];

  mostrarModal = false;
  modoEdicion = false;
  usuarioSeleccionado: Usuario = this.usuarioVacio();

  private readonly REGEX_SOLO_LETRAS = /^[A-Za-zÀ-ÿÑñ\s]+$/;
  private readonly REGEX_TELEFONO = /^[0-9]{10}$/;
  private readonly REGEX_USUARIO = /^[A-Za-z0-9_]+$/;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'No se pudieron cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  // ===================== FILTROS =====================
  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u => {
      const coincideTexto =
        !texto ||
        `${u.nombre_us} ${u.ap_us} ${u.am_us ?? ''}`.toLowerCase().includes(texto) ||
        u.usuario.toLowerCase().includes(texto);

      const coincideRol =
        this.filtroRol === 'Todos' ||
        (this.filtroRol === 'pendiente' ? !u.rol : u.rol === this.filtroRol);

      return coincideTexto && coincideRol;
    });
  }

  cambiarFiltro(rol: 'Todos' | 'admin' | 'cajero' | 'pendiente'): void {
    this.filtroRol = rol;
    this.aplicarFiltros();
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalConRol(): number {
    return this.usuarios.filter(u => !!u.rol).length;
  }

  get totalPendientes(): number {
    return this.usuarios.filter(u => !u.rol).length;
  }

  etiquetaRol(rol: Rol): string {
    if (rol === 'admin') return 'Administrador';
    if (rol === 'cajero') return 'Cajero';
    return 'Pendiente';
  }

  // ===================== AVATAR =====================
  iniciales(u: Usuario): string {
    return `${u.nombre_us?.charAt(0) ?? ''}${u.ap_us?.charAt(0) ?? ''}`.toUpperCase();
  }

  colorAvatar(u: Usuario): string {
    const colores = ['bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700'];
    const index = (u.id_usuario ?? 0) % colores.length;
    return colores[index];
  }

  // ===================== MODAL =====================
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.usuarioSeleccionado = this.usuarioVacio();
    this.errorMsg = '';
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioSeleccionado = { ...usuario };
    this.errorMsg = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  private usuarioVacio(): Usuario {
    return {
      nombre_us: '',
      ap_us: '',
      am_us: '',
      direccion: '',
      telefono: '',
      usuario: '',
      password: '',
      rol: null,
    };
  }

  // ===================== VALIDACIÓN =====================
  private validarUsuario(): string | null {
    const u = this.usuarioSeleccionado;
    if (!this.REGEX_SOLO_LETRAS.test(u.nombre_us)) return 'El nombre solo puede contener letras';
    if (!this.REGEX_SOLO_LETRAS.test(u.ap_us)) return 'El apellido paterno solo puede contener letras';
    if (!this.REGEX_SOLO_LETRAS.test(u.am_us)) return 'El apellido materno solo puede contener letras';
    if (u.telefono && !this.REGEX_TELEFONO.test(u.telefono)) return 'El teléfono debe tener 10 dígitos numéricos';
    if (!this.REGEX_USUARIO.test(u.usuario) || u.usuario.length < 4) return 'El usuario debe tener al menos 4 caracteres (letras, números, guion bajo)';
    if (!this.modoEdicion && (!u.password || u.password.length < 8)) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  }

  // ===================== GUARDAR =====================
  guardarUsuario(): void {
    const error = this.validarUsuario();
    if (error) {
      this.errorMsg = error;
      return;
    }

    this.cargando = true;

    if (this.modoEdicion && this.usuarioSeleccionado.id_usuario) {
      const { password, usuario, ...camposEditables } = this.usuarioSeleccionado;
      this.usuariosService.actualizar(this.usuarioSeleccionado.id_usuario, camposEditables).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarModal();
          Swal.fire({ icon: 'success', title: 'Usuario actualizado', confirmButtonColor: '#4A3B32' });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.error || 'Error al actualizar el usuario';
        }
      });
    } else {
      this.usuariosService.crear(this.usuarioSeleccionado).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarModal();
          Swal.fire({ icon: 'success', title: 'Usuario creado', confirmButtonColor: '#4A3B32' });
          this.cargarUsuarios();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.error || 'Error al crear el usuario';
        }
      });
    }
  }

  // ===================== ELIMINAR =====================
  confirmarEliminar(usuario: Usuario): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar a ${usuario.nombre_us}?`,
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4A3B32'
    }).then(result => {
      if (result.isConfirmed && usuario.id_usuario) {
        this.usuariosService.eliminar(usuario.id_usuario).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Usuario eliminado', confirmButtonColor: '#4A3B32' });
            this.cargarUsuarios();
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.error?.error || '', confirmButtonColor: '#4A3B32' });
          }
        });
      }
    });
  }
}