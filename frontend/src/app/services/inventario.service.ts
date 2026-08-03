import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor { id_proveedor?: number; nombre_pv: string; direccion_pv: string; telefono_pv: string; }
export interface Producto {
  id_producto?: number; codigo: string; nombre_producto: string; precio_compra: number;
  precio_venta: number; existencia: number; stock_minimo: number; iva: number;
  id_proveedor: number | null; nombre_pv?: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  constructor(private http: HttpClient) {}
  productos(buscar = ''): Observable<Producto[]> { return this.http.get<Producto[]>('/api/productos', { params: { buscar }, withCredentials: true }); }
  crearProducto(p: Producto) { return this.http.post<Producto>('/api/productos', p, { withCredentials: true }); }
  actualizarProducto(id: number, p: Partial<Producto>) { return this.http.put<Producto>(`/api/productos/${id}`, p, { withCredentials: true }); }
  eliminarProducto(id: number) { return this.http.delete(`/api/productos/${id}`, { withCredentials: true }); }
  proveedores(): Observable<Proveedor[]> { return this.http.get<Proveedor[]>('/api/proveedor', { withCredentials: true }); }
  crearProveedor(p: Proveedor) { return this.http.post<Proveedor>('/api/proveedor', p, { withCredentials: true }); }
  actualizarProveedor(id: number, p: Proveedor) { return this.http.put<Proveedor>(`/api/proveedor/${id}`, p, { withCredentials: true }); }
  eliminarProveedor(id: number) { return this.http.delete(`/api/proveedor/${id}`, { withCredentials: true }); }
}
