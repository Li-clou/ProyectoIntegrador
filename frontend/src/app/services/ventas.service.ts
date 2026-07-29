import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCarrito } from './cart.service';

export interface PayloadVenta {
  items: { id_producto_dv: number; cantidad: number; precio_s_dv: number }[];
  metodo_pago: 'credito' | 'transferencia';
  subtotal: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly baseUrl = '/api/ventas';

  constructor(private http: HttpClient) {}

  registrarVenta(items: ItemCarrito[], metodoPago: 'credito' | 'transferencia'): Observable<any> {
    const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);

    const payload: PayloadVenta = {
      items: items.map((i) => ({
        id_producto_dv: i.idProducto,
        cantidad: i.cantidad,
        precio_s_dv: i.precioUnitario,
      })),
      metodo_pago: metodoPago,
      subtotal,
      total: subtotal, // ajustar si el backend calcula IVA aparte
    };

    return this.http.post(this.baseUrl, payload, { withCredentials: true });
  }
}