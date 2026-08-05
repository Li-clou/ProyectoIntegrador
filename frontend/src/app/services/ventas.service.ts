import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCarrito } from './cart.service';
import { VentaResumen } from '../models/venta.model';
import { environment } from '../../environments/enviroments';
export interface PayloadVenta {
  items: { id_producto_dv: number; cantidad: number }[];
  metodo_pago: string;
  monto_recibido?: number;
}

export interface FiltrosVentas {
  fecha_inicio?: string;
  fecha_fin?: string;
  id_usuario?: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
    private readonly baseUrl = environment.ventasApi + '/ventas';

  constructor(private http: HttpClient) {}

  listar(filtros?: FiltrosVentas): Observable<VentaResumen[]> {
    let params = new HttpParams();
    if (filtros?.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros?.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
    if (filtros?.id_usuario) params = params.set('id_usuario', filtros.id_usuario.toString());

    return this.http.get<VentaResumen[]>(this.baseUrl, { params, withCredentials: true });
  }

  obtener(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  registrarVenta(
    items: ItemCarrito[],
    metodoPago: string,
    montoRecibido?: number
  ): Observable<any> {
    const payload: PayloadVenta = {
      items: items.map((i) => ({
        id_producto_dv: i.idProducto,
        cantidad: i.cantidad,
      })),
      metodo_pago: metodoPago,
    };

    if (metodoPago === 'efectivo' && montoRecibido !== undefined) {
      payload.monto_recibido = montoRecibido;
    }

    return this.http.post(this.baseUrl, payload, { withCredentials: true });
  }

  obtenerTicket(idVenta: number, email?: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${idVenta}/ticket`, email ? { email } : {}, {
      withCredentials: true,
      responseType: 'blob',
    });
  }
}
