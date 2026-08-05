import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.models';
import { environment } from '../../environments/enviroments';
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly baseUrl = environment.inventarioApi + '/productos';

  constructor(private http: HttpClient) {}

  listar(buscar?: string, id_marca?: number): Observable<Producto[]> {
    let params = '';
    const query: string[] = [];
    if (buscar) query.push(`buscar=${encodeURIComponent(buscar)}`);
    if (id_marca) query.push(`id_marca=${id_marca}`);
    if (query.length) params = `?${query.join('&')}`;

    return this.http.get<Producto[]>(`${this.baseUrl}${params}`, { withCredentials: true });
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto, { withCredentials: true });
  }

  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  ajustarStock(id: number, cantidad: number, tipo: 'entrada' | 'salida'): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}/stock`, { cantidad, tipo }, { withCredentials: true });
  }
}