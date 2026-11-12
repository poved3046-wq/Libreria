
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AutorService } from './services/autor.service';
import { LibroService } from './services/service.libro';
import { PrestamoService } from './services/prestamo.service';

import { Autor } from './models/autors';
import { Libro } from './models/libro';
import { Prestamo } from './models/prestamo';

type Seccion = 'autores' | 'libros' | 'prestamos';
type Vista = 'menu' | 'formulario' | 'lista';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  private autorService = inject(AutorService);
  private libroService = inject(LibroService);
  private prestamoService = inject(PrestamoService);

  seccion: Seccion = 'autores';
  vista: Vista = 'menu';

  // =====================================
  // AUTORES
  // =====================================

  autores: Autor[] = [];
  cargando = false;
  error = '';
  editando = false;
  idEditando = '';

  autor: Autor = {
    name: '',
    nationality: '',
    birthYear: undefined
  };

  // =====================================
  // LIBROS
  // =====================================

  libros: Libro[] = [];
  cargandoLibros = false;
  errorLibro = '';
  editandoLibro = false;
  idLibroEditando = '';

  libro: Libro = {
    title: '',
    isbn: '',
    authorId: '',
    year: undefined,
    available: true
  };

  // =====================================
  // PRÉSTAMOS
  // =====================================

  prestamos: Prestamo[] = [];
  cargandoPrestamos = false;
  errorPrestamo = '';
  editandoPrestamo = false;
  idPrestamoEditando = '';

  prestamo: Prestamo = {
    bookId: '',
    userName: '',
    loanDate: new Date().toISOString().slice(0, 10),
    returned: false
  };

  // =====================================
  // INICIALIZACIÓN
  // =====================================

  ngOnInit(): void {
    this.listarAutores();
    this.listarLibros();
  }

  // =====================================
  // NAVEGACIÓN
  // =====================================

  cambiarSeccion(seccion: Seccion): void {
    this.seccion = seccion;
    this.vista = 'menu';

    this.limpiarFormulario();
    this.limpiarFormularioLibro();
    this.limpiarFormularioPrestamo();

    if (seccion === 'autores') {
      this.listarAutores();
    }

    if (seccion === 'libros') {
      this.listarAutores();
      this.listarLibros();
    }

    if (seccion === 'prestamos') {
      this.listarLibros();
      this.listarPrestamos();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirVista(vista: 'formulario' | 'lista'): void {
    this.vista = vista;

    if (this.seccion === 'autores') {
      if (vista === 'formulario' && !this.editando) {
        this.limpiarFormulario();
      }
      this.listarAutores();
    }

    if (this.seccion === 'libros') {
      if (vista === 'formulario' && !this.editandoLibro) {
        this.limpiarFormularioLibro();
      }
      this.listarAutores();
      this.listarLibros();
    }

    if (this.seccion === 'prestamos') {
      if (vista === 'formulario' && !this.editandoPrestamo) {
        this.limpiarFormularioPrestamo();
      }
      this.listarLibros();
      this.listarPrestamos();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlMenu(): void {
    this.vista = 'menu';

    this.limpiarFormulario();
    this.limpiarFormularioLibro();
    this.limpiarFormularioPrestamo();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =====================================
  // AUTORES: LISTAR
  // =====================================

  listarAutores(): void {
    console.log('INICIANDO CARGA DE AUTORES');

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.autorService.obtenerAutores().subscribe({
      next: datos => {
        console.log('AUTORES RECIBIDOS:', datos);

        this.autores = datos;
        this.cargando = false;

        this.cdr.detectChanges();

        console.log('CARGA DE AUTORES TERMINADA:', this.autores);
      },
      error: err => {
        console.error('ERROR AL CARGAR AUTORES:', err);

        this.error = 'No fue posible cargar los autores.';
        this.cargando = false;

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // AUTORES: GUARDAR
  // =====================================

  guardarAutor(): void {
    if (!this.autor.name.trim() || !this.autor.nationality.trim()) {
      this.error = 'Completa el nombre y la nacionalidad.';
      return;
    }

    if (this.editando) {
      this.autorService.actualizarAutor(
        this.idEditando,
        this.autor
      ).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.listarAutores();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.error = 'No se pudo actualizar el autor.';
        }
      });
    } else {
      this.autorService.crearAutor(this.autor).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.listarAutores();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.error = 'No se pudo registrar el autor.';
        }
      });
    }
  }

  // =====================================
  // AUTORES: EDITAR
  // =====================================

  editarAutor(autor: Autor): void {
    this.autor = {
      name: autor.name,
      nationality: autor.nationality,
      birthYear: autor.birthYear
    };

    this.idEditando = autor._id ?? '';
    this.editando = true;
    this.error = '';
    this.vista = 'formulario';
  }

  // =====================================
  // AUTORES: ELIMINAR
  // =====================================

  eliminarAutor(id?: string): void {
    if (!id) return;

    if (confirm('¿Seguro que deseas eliminar este autor?')) {
      this.autorService.eliminarAutor(id).subscribe({
        next: () => this.listarAutores(),
        error: err => {
          console.error(err);
          this.error = 'No se pudo eliminar. Puede tener libros asociados.';
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.autor = {
      name: '',
      nationality: '',
      birthYear: undefined
    };

    this.editando = false;
    this.idEditando = '';
    this.error = '';
  }

  // =====================================
  // LIBROS: LISTAR
  // =====================================

  listarLibros(): void {
    console.log('INICIANDO CARGA DE LIBROS');

    this.cargandoLibros = true;
    this.errorLibro = '';
    this.cdr.detectChanges();

    this.libroService.obtenerLibros().subscribe({
      next: datos => {
        console.log('LIBROS RECIBIDOS:', datos);

        this.libros = datos;
        this.cargandoLibros = false;

        this.cdr.detectChanges();

        console.log('CARGA DE LIBROS TERMINADA:', this.libros);
      },
      error: err => {
        console.error('ERROR AL CARGAR LIBROS:', err);

        this.errorLibro = 'No fue posible cargar los libros.';
        this.cargandoLibros = false;

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // LIBROS: GUARDAR
  // =====================================

  guardarLibro(): void {
    if (
      !this.libro.title.trim() ||
      !this.libro.isbn.trim() ||
      !this.libro.authorId
    ) {
      this.errorLibro = 'Completa el título, ISBN y autor.';
      return;
    }

    if (this.editandoLibro) {
      this.libroService.actualizarLibro(
        this.idLibroEditando,
        this.libro
      ).subscribe({
        next: () => {
          this.limpiarFormularioLibro();
          this.listarLibros();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.errorLibro = 'No se pudo actualizar el libro.';
        }
      });
    } else {
      this.libroService.crearLibro(this.libro).subscribe({
        next: () => {
          this.limpiarFormularioLibro();
          this.listarLibros();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.errorLibro = 'No se pudo registrar el libro. Verifica que el ISBN no esté repetido.';
        }
      });
    }
  }

  // =====================================
  // LIBROS: EDITAR
  // =====================================

  editarLibro(libro: Libro): void {
    this.libro = {
      title: libro.title,
      isbn: libro.isbn,
      authorId: libro.authorId,
      year: libro.year,
      available: libro.available
    };

    this.idLibroEditando = libro._id ?? '';
    this.editandoLibro = true;
    this.errorLibro = '';
    this.vista = 'formulario';
  }

  // =====================================
  // LIBROS: ELIMINAR
  // =====================================

  eliminarLibro(id?: string): void {
    if (!id) return;

    if (confirm('¿Seguro que deseas eliminar este libro?')) {
      this.libroService.eliminarLibro(id).subscribe({
        next: () => this.listarLibros(),
        error: err => {
          console.error(err);
          this.errorLibro = 'No se pudo eliminar el libro.';
        }
      });
    }
  }

  limpiarFormularioLibro(): void {
    this.libro = {
      title: '',
      isbn: '',
      authorId: '',
      year: undefined,
      available: true
    };

    this.editandoLibro = false;
    this.idLibroEditando = '';
    this.errorLibro = '';
  }

  obtenerNombreAutor(authorId: string): string {
    const autorEncontrado = this.autores.find(
      autor => autor._id === authorId
    );

    return autorEncontrado
      ? autorEncontrado.name
      : 'Autor no encontrado';
  }

  // =====================================
  // PRÉSTAMOS: LISTAR
  // =====================================

  listarPrestamos(): void {
    console.log('INICIANDO CARGA DE PRÉSTAMOS');

    this.cargandoPrestamos = true;
    this.errorPrestamo = '';
    this.cdr.detectChanges();

    this.prestamoService.obtenerPrestamos().subscribe({
      next: datos => {
        console.log('PRÉSTAMOS RECIBIDOS:', datos);

        this.prestamos = datos;
        this.cargandoPrestamos = false;

        this.cdr.detectChanges();

        console.log('CARGA DE PRÉSTAMOS TERMINADA:', this.prestamos);
      },
      error: err => {
        console.error('ERROR AL CARGAR PRÉSTAMOS:', err);

        this.errorPrestamo = 'No fue posible cargar los préstamos.';
        this.cargandoPrestamos = false;

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // PRÉSTAMOS: GUARDAR
  // =====================================

  guardarPrestamo(): void {
    if (
      !this.prestamo.bookId ||
      !this.prestamo.userName.trim() ||
      !this.prestamo.loanDate
    ) {
      this.errorPrestamo = 'Completa el libro, el nombre y la fecha.';
      return;
    }

    if (this.editandoPrestamo) {
      this.prestamoService.actualizarPrestamo(
        this.idPrestamoEditando,
        {
          userName: this.prestamo.userName,
          loanDate: this.prestamo.loanDate
        }
      ).subscribe({
        next: () => {
          this.limpiarFormularioPrestamo();
          this.listarPrestamos();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.errorPrestamo = 'No se pudo actualizar el préstamo.';
        }
      });
    } else {
      this.prestamoService.crearPrestamo({
        bookId: this.prestamo.bookId,
        userName: this.prestamo.userName,
        loanDate: this.prestamo.loanDate,
        returned: false
      }).subscribe({
        next: () => {
          this.limpiarFormularioPrestamo();
          this.listarPrestamos();
          this.listarLibros();
          this.vista = 'lista';
        },
        error: err => {
          console.error(err);
          this.errorPrestamo = err.error?.message ||
            'No se pudo registrar el préstamo. Verifica que el libro esté disponible.';
        }
      });
    }
  }

  // =====================================
  // PRÉSTAMOS: EDITAR
  // =====================================

  editarPrestamo(item: Prestamo): void {
    if (item.returned) {
      this.errorPrestamo = 'No puedes editar un préstamo que ya fue devuelto.';
      return;
    }

    this.prestamo = {
      bookId: item.bookId,
      userName: item.userName,
      loanDate: item.loanDate
        ? item.loanDate.substring(0, 10)
        : '',
      returned: item.returned
    };

    this.idPrestamoEditando = item._id ?? '';
    this.editandoPrestamo = true;
    this.errorPrestamo = '';
    this.vista = 'formulario';
  }

  // =====================================
  // PRÉSTAMOS: DEVOLVER
  // =====================================

  devolverPrestamo(id?: string): void {
    if (!id) return;

    if (confirm('¿Confirmas que este libro fue devuelto?')) {
      this.prestamoService.actualizarPrestamo(id, {
        returned: true
      }).subscribe({
        next: () => {
          this.listarPrestamos();
          this.listarLibros();
        },
        error: err => {
          console.error(err);
          this.errorPrestamo = 'No se pudo registrar la devolución.';
        }
      });
    }
  }

  // =====================================
  // PRÉSTAMOS: ELIMINAR
  // =====================================

  eliminarPrestamo(id?: string): void {
    if (!id) return;

    if (confirm('¿Seguro que deseas eliminar este préstamo?')) {
      this.prestamoService.eliminarPrestamo(id).subscribe({
        next: () => {
          this.listarPrestamos();
          this.listarLibros();
        },
        error: err => {
          console.error(err);
          this.errorPrestamo = 'No se pudo eliminar el préstamo.';
        }
      });
    }
  }

  limpiarFormularioPrestamo(): void {
    this.prestamo = {
      bookId: '',
      userName: '',
      loanDate: new Date().toISOString().slice(0, 10),
      returned: false
    };

    this.editandoPrestamo = false;
    this.idPrestamoEditando = '';
    this.errorPrestamo = '';
  }

  obtenerNombreLibro(bookId: string): string {
    const libroEncontrado = this.libros.find(
      item => item._id === bookId
    );

    return libroEncontrado
      ? libroEncontrado.title
      : 'Libro no encontrado';
  }
}
