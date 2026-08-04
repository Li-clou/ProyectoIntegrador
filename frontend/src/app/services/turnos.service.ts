import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TurnoActivo {
  id_turno: number;
  id_usuario: number;
  tipo_turno: string;
  fecha_inicio: string;
  monto_inicial: number;
  estado: string;
  totalVendido: number;
  transacciones: number;
}

export interface ResultadoCierre {
  turno: any;
  totalVendido: number;
  transacciones: number;
}

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private readonly baseUrl = '/api/turnos';

  constructor(private http: HttpClient) {}

  actual(): Observable<TurnoActivo | null> {
    return this.http.get<TurnoActivo | null>(`${this.baseUrl}/mi-turno`, { withCredentials: true });
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/historial`, { withCredentials: true });
  }

  abrir(tipo: string, montoInicial: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/abrir`, { tipo_turno: tipo, monto_inicial: montoInicial }, { withCredentials: true });
  }

  cerrar(id_turno: number, montoFinal: number): Observable<ResultadoCierre> {
    return this.http.post<ResultadoCierre>(`${this.baseUrl}/cerrar`, { monto_final: montoFinal }, { withCredentials: true });
  }

  // Se mantienen por compatibilidad (usados en sidebar.ts)
  miTurno(): Observable<TurnoActivo | null> { return this.actual(); }
  cerrarTurno(montoFinal: number): Observable<ResultadoCierre> {
    return this.http.post<ResultadoCierre>(`${this.baseUrl}/cerrar`, { monto_final: montoFinal }, { withCredentials: true });
  }
}