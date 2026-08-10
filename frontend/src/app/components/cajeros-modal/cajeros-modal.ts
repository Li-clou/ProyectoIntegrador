import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.models';

@Component({
  selector: 'app-cajeros-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './cajeros-modal.html',
})
export class CajerosModal implements OnChanges {
  @Input() abierto = false;
  @Output() cerrar = new EventEmitter<void>();

  cajeros: Usuario[] = [];
  cajerosFiltrados: Usuario[] = [];

  cargando = false;
  errorMsg = '';
  busqueda = '';

  mostrarFormulario = false;
  modoEdicion = false;
  cajeroSeleccionado: Usuario = this.cajeroVacio();

  private readonly REGEX_SOLO_LETRAS = /^[A-Za-zÀ-ÿÑñ\s]+$/;
  private readonly REGEX_TELEFONO = /^[0-9]{10}$/;
  private readonly REGEX_USUARIO = /^[A-Za-z0-9_]+$/;

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que se abre el modal, recargamos la lista fresca
    if (changes['abierto'] && this.abierto) {
      this.busqueda = '';
      this.mostrarFormulario = false;
      this.cargarCajeros();
    }
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  // ===================== CARGA Y FILTRO =====================
  cargarCajeros(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.usuariosService.listar().subscribe({
      next: (data) => {
        // Solo nos quedamos con los que ya tienen rol = 'cajero'
        this.cajeros = data.filter((u) => u.rol === 'cajero');
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges(); // fuerza el repintado (igual que en usuario.ts)
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'No se pudieron cargar los cajeros';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  aplicarFiltro(): void {
    const texto = this.busqueda.trim().toLowerCase();
    this.cajerosFiltrados = !texto
      ? this.cajeros
      : this.cajeros.filter(
          (c) =>
            `${c.nombre_us} ${c.ap_us} ${c.am_us ?? ''}`.toLowerCase().includes(texto) ||
            c.usuario.toLowerCase().includes(texto),
        );
  }

  // ===================== AVATAR =====================
  iniciales(u: Usuario): string {
    return `${u.nombre_us?.charAt(0) ?? ''}${u.ap_us?.charAt(0) ?? ''}`.toUpperCase();
  }

  colorAvatar(u: Usuario): string {
    const colores = [
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
    ];
    const index = (u.id_usuario ?? 0) % colores.length;
    return colores[index];
  }

  // ===================== FORMULARIO =====================
  abrirNuevo(): void {
    this.modoEdicion = false;
    this.cajeroSeleccionado = this.cajeroVacio();
    this.errorMsg = '';
    this.mostrarFormulario = true;
  }

  abrirEditar(cajero: Usuario): void {
    this.modoEdicion = true;
    this.cajeroSeleccionado = { ...cajero };
    this.errorMsg = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  private cajeroVacio(): Usuario {
    return {
      nombre_us: '',
      ap_us: '',
      am_us: '',
      direccion: '',
      telefono: '',
      usuario: '',
      password: '',
      rol: 'cajero', // Este modal solo crea/edita cajeros
    };
  }

  // ===================== VALIDACIÓN =====================
  private validar(): string | null {
    const u = this.cajeroSeleccionado;
    if (!this.REGEX_SOLO_LETRAS.test(u.nombre_us)) return 'El nombre solo puede contener letras';
    if (!this.REGEX_SOLO_LETRAS.test(u.ap_us))
      return 'El apellido paterno solo puede contener letras';
    if (u.am_us && !this.REGEX_SOLO_LETRAS.test(u.am_us))
      return 'El apellido materno solo puede contener letras';
    if (u.telefono && !this.REGEX_TELEFONO.test(u.telefono))
      return 'El teléfono debe tener 10 dígitos numéricos';
    if (!this.REGEX_USUARIO.test(u.usuario) || u.usuario.length < 4)
      return 'El usuario debe tener al menos 4 caracteres (letras, números, guion bajo)';
    if (!this.modoEdicion && (!u.password || u.password.length < 8))
      return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  }

  // ===================== GUARDAR =====================
  guardar(): void {
    const error = this.validar();
    if (error) {
      this.errorMsg = error;
      return;
    }

    this.cargando = true;
    this.cajeroSeleccionado.rol = 'cajero'; // por si acaso, siempre forzado

    if (this.modoEdicion && this.cajeroSeleccionado.id_usuario) {
      const { password, usuario, ...camposEditables } = this.cajeroSeleccionado;
      this.usuariosService
        .actualizar(this.cajeroSeleccionado.id_usuario, camposEditables)
        .subscribe({
          next: () => {
            this.cargando = false;
            this.cerrarFormulario();
            Swal.fire({
              icon: 'success',
              title: 'Cajero actualizado',
              confirmButtonColor: '#4A3B32',
            });
            this.cargarCajeros();
          },
          error: (err) => {
            this.cargando = false;
            this.errorMsg = err.error?.error || 'Error al actualizar el cajero';
            this.cdr.detectChanges();
          },
        });
    } else {
      this.usuariosService.crear(this.cajeroSeleccionado).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarFormulario();
          Swal.fire({ icon: 'success', title: 'Cajero creado', confirmButtonColor: '#4A3B32' });
          this.cargarCajeros();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.error || 'Error al crear el cajero';
          this.cdr.detectChanges();
        },
      });
    }
  }

  // ===================== ELIMINAR =====================
  confirmarEliminar(cajero: Usuario): void {
    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar a ${cajero.nombre_us}?`,
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4A3B32',
    }).then((result) => {
      if (result.isConfirmed && cajero.id_usuario) {
        this.usuariosService.eliminar(cajero.id_usuario).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cajero eliminado',
              confirmButtonColor: '#4A3B32',
            });
            this.cargarCajeros();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo eliminar',
              text: err.error?.error || '',
              confirmButtonColor: '#4A3B32',
            });
            this.cdr.detectChanges();
          },
        });
      }
    });
  }
}
