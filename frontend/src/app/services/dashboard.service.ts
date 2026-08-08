import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la estructura de los datos que envía el backend
export interface DashboardStats {
  ventasDia: number;
  transacciones: number;
  cajerosActivos: number;
  productosVendidos: number;
  inventarioBajo: number;
}

export interface CajeroActivo {
  id_usuario: number;
  nombre_us: string;
  ap_us: string;
  fecha_inicio: string;
  montoVendido: number;
  transacciones: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  
  // Tu proxy en Angular redirige '/api' al backend (localhost:3000)
  private baseUrl = '/api/dashboard';

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getCajerosActivos(): Observable<CajeroActivo[]> {
    return this.http.get<CajeroActivo[]>(`${this.baseUrl}/cajeros-activos`);
  }
}