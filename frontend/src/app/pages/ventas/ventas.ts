import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.services';
import { VentaResumen } from '../../models/venta.model';
import { Usuario } from '../../models/usuario.models';

type RangoFecha = 'hoy' | 'semana' | 'mes' | 'todos';
type Rol = 'admin' | 'cajero' | 'pendiente';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
})
export class VentasComponent implements OnInit {

  ventas: VentaResumen[] = [];
  cajeros: Usuario[] = [];

  rol: Rol = 'cajero';

  cargando = false;
  errorMsg = '';

  busqueda = '';
  rango: RangoFecha = 'hoy';
  filtroCajero: number | 'Todos' = 'Todos';

  mostrarDetalle = false;
  ventaDetalle: any = null;
  cargandoDetalle = false;

  constructor(
    private ventasService: VentasService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (res: any) => {
        this.rol = res?.usuario?.rol || 'cajero';
        if (this.rol === 'admin') {
          this.cargarCajeros();
        }
        this.cargarVentas();
      },
      error: () => {
        this.rol = 'cajero';
        this.cargarVentas();
      }
    });
  }

  get esAdmin(): boolean {
    return this.rol === 'admin';
  }

  private rangoAFechas(): { fecha_inicio?: string } {
    if (this.rango === 'todos') return {};

    const inicio = new Date();

    if (this.rango === 'hoy') {
      inicio.setHours(0, 0, 0, 0);
    } else if (this.rango === 'semana') {
      const dia = inicio.getDay();
      const diff = dia === 0 ? 6 : dia - 1; // lunes como inicio de semana
      inicio.setDate(inicio.getDate() - diff);
      inicio.setHours(0, 0, 0, 0);
    } else if (this.rango === 'mes') {
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
    }

    return { fecha_inicio: inicio.toISOString() };
  }

  cargarCajeros(): void {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.cajeros = data.filter(u => u.rol === 'cajero');
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  cargarVentas(): void {
    this.cargando = true;
    this.errorMsg = '';

    const filtros: any = this.rangoAFechas();
    if (this.esAdmin && this.filtroCajero !== 'Todos') {
      filtros.id_usuario = this.filtroCajero;
    }

    this.ventasService.listar(filtros).subscribe({
      next: (data) => {
        this.ventas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'No se pudieron cargar las ventas';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarRango(rango: RangoFecha): void {
    this.rango = rango;
    this.cargarVentas();
  }

  cambiarFiltroCajero(id: number | 'Todos'): void {
    this.filtroCajero = id;
    this.cargarVentas();
  }

  get ventasFiltradas(): VentaResumen[] {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) return this.ventas;
    return this.ventas.filter(v =>
      String(v.id_venta).includes(texto) ||
      `${v.nombre_us ?? ''} ${v.ap_us ?? ''}`.toLowerCase().includes(texto)
    );
  }

  get totalVentas(): number {
    return this.ventasFiltradas.reduce((acc, v) => acc + Number(v.total), 0);
  }

  get totalTransacciones(): number {
    return this.ventasFiltradas.length;
  }

  get ticketPromedio(): number {
    return this.totalTransacciones ? this.totalVentas / this.totalTransacciones : 0;
  }

  iniciales(v: VentaResumen): string {
    return `${v.nombre_us?.charAt(0) ?? ''}${v.ap_us?.charAt(0) ?? ''}`.toUpperCase() || '—';
  }

  colorAvatar(v: VentaResumen): string {
    const colores = ['bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700'];
    const index = (v.id_usuario_v ?? 0) % colores.length;
    return colores[index];
  }

  etiquetaMetodo(metodo: string): string {
    const mapa: Record<string, string> = {
      efectivo: 'Efectivo', tarjeta: 'Tarjeta', qr: 'QR', vales: 'Vales', credito: 'Crédito',
    };
    return mapa[metodo] || metodo;
  }

  colorMetodo(metodo: string): string {
    const mapa: Record<string, string> = {
      efectivo: 'bg-emerald-50 text-emerald-600',
      tarjeta: 'bg-sky-50 text-sky-600',
      qr: 'bg-violet-50 text-violet-600',
      vales: 'bg-amber-50 text-amber-600',
      credito: 'bg-rose-50 text-rose-600',
    };
    return mapa[metodo] || 'bg-stone-100 text-stone-500';
  }

  verDetalle(venta: VentaResumen): void {
    this.mostrarDetalle = true;
    this.cargandoDetalle = true;
    this.ventaDetalle = null;

    this.ventasService.obtener(venta.id_venta).subscribe({
      next: (data) => {
        this.ventaDetalle = data;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.errorMsg = err.error?.error || 'No se pudo cargar el detalle de la venta';
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.ventaDetalle = null;
  }

  descargarTicket(idVenta: number): void {
    this.ventasService.obtenerTicket(idVenta).subscribe({
      next: (pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${idVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMsg = 'No se pudo generar el ticket';
      }
    });
  }
}