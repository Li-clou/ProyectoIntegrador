import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  // Solo se usa en móvil/tablet para mostrar u ocultar la sidebar
  sidebarAbierta = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  alternarSidebar(): void {
    this.sidebarAbierta.update((valor) => !valor);
  }

  cerrarSidebar(): void {
    this.sidebarAbierta.set(false);
  }

  // 👇 NUEVO: pide confirmación antes de cerrar sesión
  async cerrarSesion(): Promise<void> {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar tu sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3B32',
      cancelButtonColor: '#94a3b8'
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio-sesion']);
      },
      error: () => {
        this.router.navigate(['/inicio-sesion']);
      }
    });
  }
}