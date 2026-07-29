import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
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

  alternarSidebar(): void {
    this.sidebarAbierta.update((valor) => !valor);
  }

  cerrarSidebar(): void {
    this.sidebarAbierta.set(false);
  }
}