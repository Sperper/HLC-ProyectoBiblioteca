import { Component } from '@angular/core';
import { ProyectoBiblioteca } from '../proyecto-biblioteca';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  tareaEditando: ProyectoBiblioteca;
  arrayColeccionTareas: any = [
    {
      id: '',
      data: {} as ProyectoBiblioteca,
    },
  ];

  constructor(private firestoreService: FirestoreService, private router: Router) {
    // Crear un libro vacío para empezar
    this.tareaEditando = {} as ProyectoBiblioteca;

    this.obtenerListaTareas();
  }

  clicBotonInsertar() {
    this.firestoreService.insertar('tareas', this.tareaEditando).then(() => {
      console.log('Tarea creada correctamente!');
      // Limpiar el libro que se estaba editando
      this.tareaEditando = {} as ProyectoBiblioteca;
    }),
      (error: any) => {
        console.error(error);
      };
  }

  obtenerListaTareas() {
    this.firestoreService
      .consultar('tareas')
      .subscribe((resultadoConsultaTareas: any) => {
        this.arrayColeccionTareas = [];
        resultadoConsultaTareas.forEach((datosTarea: any) => {
          this.arrayColeccionTareas.push({
            id: datosTarea.payload.doc.id,
            data: datosTarea.payload.doc.data(),
          });
        });
      });
  }

  idLibroSelec: string = '';
  
  selecLibro(libroSelec: any) {
    console.log('Libro seleccionado: ');
    console.log(libroSelec);
    this.idLibroSelec = libroSelec.id;
    this.tareaEditando.titulo = libroSelec.data.titulo;
    this.tareaEditando.editorial = libroSelec.data.editorial;
    this.tareaEditando.autor = libroSelec.data.autor;
    this.router.navigate(['/detalle', this.idLibroSelec]);
  }

  clickBotonBorrar() {
    this.firestoreService.borrar('tareas', this.idLibroSelec).then(() => {
      // Actualizar la lista completa
      this.obtenerListaTareas();
      // Limpiar el libro que se estaba editando
      this.tareaEditando = {} as ProyectoBiblioteca;
    });
  }

  clicBotonModificar() {
    this.firestoreService
      .actualizar('tareas', this.idLibroSelec, this.tareaEditando)
      .then(() => {
        // Actualizar la lista completa
        this.obtenerListaTareas();
        // Limpiar el libro que se estaba editando
        this.tareaEditando = {} as ProyectoBiblioteca;
      });
  }

  document: any = {
    id: '',
    data: {} as ProyectoBiblioteca,
  }

  
}
