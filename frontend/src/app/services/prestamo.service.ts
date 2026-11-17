
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prestamo } from '../models/prestamo';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private http = inject(HttpClient);

  private api = 'https://libreria-5vr9.onrender.com/api/v1/loans';

  obtenerPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.api);
  }

  crearPrestamo(prestamo: Prestamo): Observable<any> {
    return this.http.post<any>(this.api, prestamo);
  }

  actualizarPrestamo(
    id: string,
    prestamo: Partial<Prestamo>
  ): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, prestamo);
  }

  eliminarPrestamo(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
