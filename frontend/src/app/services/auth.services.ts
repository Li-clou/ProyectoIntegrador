import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

const TOKEN_KEY = 'kunibo_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.authApi || '/api';

  // Signal con el token actual, para que cualquier parte de la app
  // (guards, interceptor) pueda leerlo de forma reactiva si hace falta.
  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  constructor(private http: HttpClient) {}

  registrarCliente(datos: RegistroPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, datos);
  }

  login(datos: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, datos).pipe(
      tap((resp: any) => {
        if (resp?.token) {
          this.guardarToken(resp.token);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.limpiarToken())
    );
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  loginConGoogle(credential: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google`, { credential }).pipe(
      tap((resp: any) => {
        if (resp?.token) {
          this.guardarToken(resp.token);
        }
      })
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  limpiarToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  estaAutenticado(): boolean {
    return !!this.token();
  }
}