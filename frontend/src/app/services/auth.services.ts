import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroPayload {
  nombre_us: string;
  ap_us: string;
  am_us: string;
  direccion: string;
  telefono: string;
  usuario: string;
  password: string;
}

export interface LoginPayload {
  usuario: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Ruta relativa: el proxy de Angular la reenvia a http://localhost:3000/api
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  registrarCliente(datos: RegistroPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, datos, { withCredentials: true });
  }

  login(datos: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, datos, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  // El AuthGuard usa esto para saber si hay sesion activa.
  // Como la cookie es httpOnly, Angular no puede leerla directo;
  // preguntamos al backend y el confirma segun el JWT de la cookie.
  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }


  loginConGoogle(credential: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/google`, { credential }, { withCredentials: true });
}
}