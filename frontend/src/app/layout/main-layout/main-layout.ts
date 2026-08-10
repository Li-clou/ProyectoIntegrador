import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.services';

type Rol = 'admin' | 'cajero' | 'pendiente';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  // Solo se usa en móvil/tablet para mostrar u ocultar la sidebar
  sidebarAbierta = signal(false);

  // Nombre y rol del usuario logueado, obtenidos de /api/me
  nombreUsuario = signal<string>('');
  rolUsuario = signal<Rol>('cajero'); // valor por defecto restrictivo mientras carga

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (res: any) => {
        const usuario = res?.usuario;
        const nombreCompleto = usuario?.nombre_us || usuario?.usuario || 'Usuario';
        this.nombreUsuario.set(nombreCompleto);
        this.rolUsuario.set((usuario?.rol as Rol) || 'cajero');
      },
      error: () => {
        this.nombreUsuario.set('Usuario');
        this.rolUsuario.set('cajero');
      },
    });
  }

  alternarSidebar(): void {
    this.sidebarAbierta.update((valor) => !valor);
  }

  cerrarSidebar(): void {
    this.sidebarAbierta.set(false);
  }
}
