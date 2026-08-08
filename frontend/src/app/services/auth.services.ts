import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroments';

export interface RegistroPayload {
  nombre_us: string;
  ap_us: string;
  am_us: string;
  direccion: string;
  telefono: string;
  usuario: string;
  password: string;
  rol: 'admin' | 'cajero' | 'pendiente';
}

export interface LoginPayload {
  usuario: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Se usa environment.authApi o por defecto '/api' para que el proxy de Angular maneje las peticiones y las cookies correctamente
  private readonly baseUrl = environment.authApi || '/api';

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

  // El AuthGuard usa esto para saber si hay sesión activa.
  // Como la cookie es httpOnly, Angular no puede leerla directo;
  // preguntamos al backend y él confirma según el JWT de la cookie.
  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }

  loginConGoogle(credential: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google`, { credential }, { withCredentials: true });
  }
}