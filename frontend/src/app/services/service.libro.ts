
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../models/libro';

@Injectable({
  providedIn: 'root'
})
export class LibroService {

  private http = inject(HttpClient);

  private api = 'http://localhost:3000/api/v1/books';

  obtenerLibros(): Observable<Libro[]> {
    return this.http.get<Libro[]>(this.api);
  }

  crearLibro(libro: Libro): Observable<any> {
    return this.http.post<any>(this.api, libro);
  }

  actualizarLibro(id: string, libro: Libro): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, libro);
  }

  eliminarLibro(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
