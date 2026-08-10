import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../environments/enviroments';

export interface AlertaStock {
  id: number;
  id_producto: number;
  nombre_producto: string;
  existencia: number;
  fecha: Date;
  leida: boolean;
}

interface ProductoNormalizado {
  id_producto: number;
  nombre: string;
  existencia: number;
}

@Injectable({ providedIn: 'root' })
export class StockAlertService {
  private readonly dashboardUrl = environment.authApi + '/dashboard';
  private readonly productosUrl = environment.inventarioApi + '/productos';

  private idsAgotadosConocidos = new Set<number>();
  private pollSub?: Subscription;
  private tipoActivo: 'admin' | 'cajero' | null = null;

  notificaciones = signal<AlertaStock[]>([]);
  noLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  constructor(private http: HttpClient) {}

  // ===== Para el dashboard de admin =====
  iniciarMonitoreoAdmin(intervaloMs = 25000): void {
    if (this.tipoActivo === 'admin') return;
    this.detenerMonitoreo();
    this.tipoActivo = 'admin';

    const consultar = () =>
      this.http.get<any[]>(`${this.dashboardUrl}/inventario-bajo`).subscribe({
        next: (items) =>
          this.procesar(
            items.map((p) => ({
              id_producto: p.id_producto,
              nombre: p.nombre_p,
              existencia: p.existencia,
            })),
          ),
        error: () => {},
      });

    consultar();
    this.pollSub = interval(intervaloMs).subscribe(consultar);
  }

  // ===== Para la pantalla del cajero =====
  iniciarMonitoreoCajero(intervaloMs = 25000): void {
    if (this.tipoActivo === 'cajero') return;
    this.detenerMonitoreo();
    this.tipoActivo = 'cajero';

    const consultar = () =>
      this.http.get<any[]>(this.productosUrl).subscribe({
        next: (items) =>
          this.procesar(
            items.map((p) => ({
              id_producto: p.id_producto,
              nombre: p.nombre_producto,
              existencia: p.existencia,
            })),
          ),
        error: () => {},
      });

    consultar();
    this.pollSub = interval(intervaloMs).subscribe(consultar);
  }

  detenerMonitoreo(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    this.tipoActivo = null;
  }

  private procesar(items: ProductoNormalizado[]): void {
    const agotadosAhora = items.filter((p) => p.existencia <= 0);

    for (const p of agotadosAhora) {
      if (!this.idsAgotadosConocidos.has(p.id_producto)) {
        this.idsAgotadosConocidos.add(p.id_producto);
        this.agregarNotificacion(p);
        this.mostrarAlertaGrande(p);
      }
    }

    // si un producto se resurtió, lo sacamos del set: si vuelve a
    // agotarse después, avisa otra vez
    const idsActuales = new Set(agotadosAhora.map((p) => p.id_producto));
    for (const id of Array.from(this.idsAgotadosConocidos)) {
      if (!idsActuales.has(id)) this.idsAgotadosConocidos.delete(id);
    }
  }

  private agregarNotificacion(p: ProductoNormalizado): void {
    this.notificaciones.update((lista) =>
      [
        {
          id: Date.now() + p.id_producto,
          id_producto: p.id_producto,
          nombre_producto: p.nombre,
          existencia: p.existencia,
          fecha: new Date(),
          leida: false,
        },
        ...lista,
      ].slice(0, 30),
    );
  }

  private mostrarAlertaGrande(p: ProductoNormalizado): void {
    Swal.fire({
      icon: 'error',
      title: '¡Producto agotado!',
      html: `<strong>${p.nombre}</strong> se quedó sin existencias.<br><span style="font-size:12px;color:#94a3b8">Genera una orden de compra lo antes posible.</span>`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc2626',
    });
  }

  marcarTodasLeidas(): void {
    this.notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
  }

  limpiarTodas(): void {
    this.notificaciones.set([]);
  }
}