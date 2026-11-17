
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Autor } from '../models/autors';

@Injectable({
  providedIn: 'root'
})
export class AutorService {

  private http = inject(HttpClient);

  private api = 'https://libreria-5vr9.onrender.com/api/v1/authors';

  obtenerAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(this.api);
  }

  crearAutor(autor: Autor): Observable<any> {
    return this.http.post<any>(this.api, autor);
  }

  actualizarAutor(id: string, autor: Autor): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, autor);
  }

  eliminarAutor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
