import { Component } from '@angular/core';
import { ProyectoBiblioteca } from '../proyecto-biblioteca';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  tareaEditando: ProyectoBiblioteca;
  arrayColeccionTareas: any = [{
    id: "",
    data: {} as ProyectoBiblioteca  
  }]

  constructor(private firestoreService: FirestoreService) {
    // Crear un libro vacío para empezar
    this.tareaEditando = {} as ProyectoBiblioteca;

    this.obtenerListaTareas();

  }

  clicBotonInsertar() {
    this.firestoreService.insertar('tareas', this.tareaEditando).then(() => {
      console.log('Tarea creada correctamente!');
      // Limpiar el libro que se estaba editando
      this.tareaEditando = {} as ProyectoBiblioteca;

    }), (error: any) => {
      console.error(error);
    }
      ;
  }

  obtenerListaTareas() {
    this.firestoreService.consultar('tareas').subscribe((resultadoConsultaTareas: any) => {
      this.arrayColeccionTareas = [];
      resultadoConsultaTareas.forEach((datosTarea: any) => {
        this.arrayColeccionTareas.push({
          id: datosTarea.payload.doc.id,
          data: datosTarea.payload.doc.data()
        });
      });
    });
  }

}
