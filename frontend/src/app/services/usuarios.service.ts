import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  // Ruta relativa, igual que AuthService: el proxy de Angular la
  // reenvía a http://localhost:3003/api/usuarios
  private readonly baseUrl = '/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl, { withCredentials: true });
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario, { withCredentials: true });
  }

  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}