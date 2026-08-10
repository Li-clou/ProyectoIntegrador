import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { TurnosService } from '../../services/turnos.service';
import Swal from 'sweetalert2';

type Rol = 'admin' | 'cajero' | 'pendiente';

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  icono: string; // path SVG
  roles: Rol[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() abierta = false;
  @Input() rol: Rol = 'cajero';
  @Output() cerrar = new EventEmitter<void>();

  cerrandoSesion = false;
  cerrandoTurno = false;

  private menuCompleto: ItemMenu[] = [
    {
      etiqueta: 'Inicio',
      ruta: '/home',
      icono:
        'M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z',
      roles: ['admin'],
    },
    {
      etiqueta: 'Inicio',
      ruta: '/cajero-homescreen',
      icono:
        'M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z',
      roles: ['cajero'],
    },
    {
      etiqueta: 'Inventario',
      ruta: '/inventario',
      icono:
        'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
      roles: ['admin', 'cajero'],
    },
    {
      etiqueta: 'Ventas',
      ruta: '/ventas',
      icono:
        'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5a1.5 1.5 0 0 0-1.5 1.5v3.75a1.5 1.5 0 0 0 1.5 1.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75Z M12 12v3.75m-9 0h18',
      roles: ['admin', 'cajero'],
    },
    {
      etiqueta: 'Usuarios',
      ruta: '/usuarios',
      icono:
        'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584a6.062 6.062 0 0 1-.038-.634m12.001-.001a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
      roles: ['admin'],
    },
  ];

  get menu(): ItemMenu[] {
    return this.menuCompleto.filter((item) => item.roles.includes(this.rol));
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private turnosService: TurnosService,
  ) {}

  onNavegar(): void {
    this.cerrar.emit();
  }

  async onCerrarTurno(): Promise<void> {
    const { value: montoFinal } = await Swal.fire({
      title: 'Cerrar caja',
      text: 'Ingresa el monto de efectivo con el que cierras tu turno',
      input: 'number',
      inputPlaceholder: '0.00',
      showCancelButton: true,
      confirmButtonText: 'Cerrar turno',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3B32',
      cancelButtonColor: '#94a3b8',
      inputValidator: (value) => {
        if (value === '' || value === null || isNaN(Number(value))) {
          return 'Ingresa un monto válido';
        }
        return null;
      },
    });

    if (montoFinal === undefined) {
      return;
    }

    this.cerrandoTurno = true;

    this.turnosService.cerrarTurno(Number(montoFinal)).subscribe({
      next: (res) => {
        this.cerrandoTurno = false;
        Swal.fire({
          icon: 'success',
          title: 'Turno cerrado',
          html: `Ventas del turno: <strong>$${res.totalVendido.toFixed(2)}</strong><br>Transacciones: <strong>${res.transacciones}</strong>`,
          confirmButtonColor: '#4A3B32',
        }).then(() => {
          this.router.navigate(['/inicio-sesion']);
        });
      },
      error: (err) => {
        this.cerrandoTurno = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cerrar el turno',
          text: err.error?.error || '',
          confirmButtonColor: '#4A3B32',
        });
      },
    });
  }

  async onCerrarSesion(): Promise<void> {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar tu sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3B32',
      cancelButtonColor: '#94a3b8',
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.cerrandoSesion = true;

    this.authService.logout().subscribe({
      next: () => {
        this.cerrandoSesion = false;
        this.router.navigate(['/inicio-sesion']);
      },
      error: () => {
        this.cerrandoSesion = false;
        this.router.navigate(['/inicio-sesion']);
      },
    });
  }
}
