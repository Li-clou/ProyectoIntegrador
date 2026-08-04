import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marca } from '../models/producto.models';

@Injectable({ providedIn: 'root' })
export class MarcasService {
  private readonly baseUrl = '/api/marcas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl, { withCredentials: true });
  }

  crear(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, marca, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}