import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.services';
import { CajerosModal } from '../../components/cajeros-modal/cajeros-modal';
import { SkeletonComponent } from '../../components/skeleton/skeleton';
import { environment } from '../../../environments/enviroments';



@Component({
  selector: 'app-homescreen',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CajerosModal, SkeletonComponent],
  templateUrl: './homescreen.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './homescreen.css',
})
export class Homescreen implements OnInit {
  mostrarCajeros = signal(false);
  usuarioActual: string = 'Cargando...';
  fechaActual: Date = new Date();
  cargando = true;

  stats: any = {
    ventasDia: 0,
    transacciones: 0,
    cajerosActivos: 0,
    productosVendidos: 0,
    inventarioBajo: 0,
  };
  cajerosActivos: any[] = [];
  inventarioBajoLista: any[] = [];
  turnosRecientes: any[] = [];
  ventasRecientes: any[] = [];

  puntosSvg: string = 'M0,45 L100,45';
  puntosCirculos: { x: number; y: number; hora: string }[] = [];

  private readonly dashboardUrl = environment.authApi + '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (res) => (this.usuarioActual = res.usuario.nombre_us || 'Administrador'),
      error: () => this.router.navigate(['/inicio-sesion']),
    });
    this.cargarDashboardCompleto();
  }

  cargarDashboardCompleto(): void {
    this.cargando = true;

    forkJoin({
      stats: this.http.get<any>(`${this.dashboardUrl}/stats`),
      cajeros: this.http.get<any[]>(`${this.dashboardUrl}/cajeros-activos`),
      inventario: this.http.get<any[]>(`${this.dashboardUrl}/inventario-bajo`),
      turnos: this.http.get<any[]>(`${this.dashboardUrl}/turnos-recientes`),
      ventas: this.http.get<any[]>(`${this.dashboardUrl}/ventas-recientes`),
      grafica: this.http.get<any[]>(`${this.dashboardUrl}/grafica`),
    }).subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.cajerosActivos = res.cajeros;
        this.inventarioBajoLista = res.inventario;
        this.turnosRecientes = res.turnos;
        this.ventasRecientes = res.ventas;
        this.procesarGrafica(res.grafica);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error dashboard:', err);
        this.cargando = false;
      },
    });
  }

  procesarGrafica(datos: any[]): void {
    if (!datos || datos.length === 0) return;
    const maxVenta = Math.max(...datos.map((d) => parseFloat(d.total_vendido))) || 1;

    this.puntosCirculos = datos.map((d, i) => {
      const x = (i / (datos.length - 1 || 1)) * 100;
      const y = 45 - (parseFloat(d.total_vendido) / maxVenta) * 35;
      return { x, y, hora: `${d.hora}:00` };
    });

    if (this.puntosCirculos.length > 0) {
      let path = `M${this.puntosCirculos[0].x},${this.puntosCirculos[0].y}`;
      for (let i = 1; i < this.puntosCirculos.length; i++) {
        path += ` L${this.puntosCirculos[i].x},${this.puntosCirculos[i].y}`;
      }
      this.puntosSvg = path;
    }
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre?.charAt(0) ?? ''}${apellido?.charAt(0) ?? ''}`.toUpperCase();
  }
  colorAvatar(id: number): string {
    const colores = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
    ];
    return colores[id % colores.length];
  }
  formatoHora(fecha: string): string {
    if (!fecha) return '--:--';
    return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/inicio-sesion']),
    });
  }
}