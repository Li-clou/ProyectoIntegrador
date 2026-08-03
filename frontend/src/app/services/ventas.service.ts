import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VentaPayload { items: { id_producto_dv: number; cantidad: number }[]; metodo_pago: 'efectivo'|'tarjeta'; monto_recibido?: number; email_ticket?: string; id_cliente_v?: number|null; }
@Injectable({ providedIn: 'root' })
export class VentasService {
  constructor(private http: HttpClient) {}
  registrarVenta(payload: VentaPayload): Observable<any> { return this.http.post('/api/ventas', payload, { withCredentials: true }); }
  listar(): Observable<any[]> { return this.http.get<any[]>('/api/ventas', { withCredentials: true }); }
  cancelar(id: number) { return this.http.patch(`/api/ventas/${id}/cancelar`, {}, { withCredentials: true }); }
  ticket(id: number, email?: string): Observable<Blob> { return this.http.post(`/api/ventas/${id}/ticket`, { email }, { withCredentials: true, responseType: 'blob' }); }
}
