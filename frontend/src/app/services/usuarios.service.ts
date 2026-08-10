import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.models';
import { environment } from '../../environments/enviroments';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = environment.usuariosApi + '/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}