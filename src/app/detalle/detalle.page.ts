import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProyectoBiblioteca } from '../proyecto-biblioteca';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: false,
})
export class DetallePage implements OnInit {

  tareaEditando: ProyectoBiblioteca;

  id: string = "";

  arrayColeccionTareas: any = [
    {
      id: '',
      data: {} as ProyectoBiblioteca,
    },
  ];

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService) { 

    this.obtenerListaTareas();

    // Crear un libro vacío para empezar
    this.tareaEditando = {} as ProyectoBiblioteca;

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

  ngOnInit() {

    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (idRecibido != null) {
      this.id = idRecibido;
    } else {
      this.id = "";
    }

    // Se hace la consulta a la base de datos para obtener los datos asociados a esa id
    this.firestoreService.consultarPorId("tareas", this.id).subscribe((resultado:any) => {
    // Preguntar si se ha encontrado un document con ese ID
    if(resultado.payload.data() != null) {
      this.document.id = resultado.payload.id
      this.document.data = resultado.payload.data();
      // Como ejemplo, mostrar el título de la tarea en consola
      console.log(this.document.data.titulo);
    } else {
      // No se ha encontrado un document on ese ID. Vacias los datos que hubiera
      this.document.data = {} as ProyectoBiblioteca;
    }
  })

  }

  document: any = {
    id:"",
    data: {} as ProyectoBiblioteca
  }
  
  idLibroSelec: string = '';

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

  
}
