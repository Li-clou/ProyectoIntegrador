import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TurnoActivo {
  id_turno: number;
  id_usuario: number;
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

  miTurno(): Observable<TurnoActivo | null> {
    return this.http.get<TurnoActivo | null>(`${this.baseUrl}/mi-turno`, { withCredentials: true });
  }

  cerrarTurno(montoFinal: number): Observable<ResultadoCierre> {
    return this.http.post<ResultadoCierre>(`${this.baseUrl}/cerrar`, { monto_final: montoFinal }, { withCredentials: true });
  }
}