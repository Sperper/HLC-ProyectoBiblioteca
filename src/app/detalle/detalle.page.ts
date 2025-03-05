import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProyectoBiblioteca } from '../proyecto-biblioteca';
import { FirestoreService } from '../firestore.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

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

  constructor(private activatedRoute: ActivatedRoute, 
    private firestoreService: FirestoreService, 
    private router: Router, private loadingController: LoadingController, 
    private alertController: AlertController,
    private toastController: ToastController,
    private imagePicker: ImagePicker) { 

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

    if (this.id === 'nuevo') {
      // Caso de inserción
      this.tareaEditando = {} as ProyectoBiblioteca;
      this.isNew = true;
    } else {
      // Caso de modificación
      this.isNew = false;
      this.firestoreService.consultarPorId("libros-samuel", this.id).subscribe((resultado:any) => {
        if(resultado.payload.data() != null) {
          this.document.id = resultado.payload.id;
          this.document.data = resultado.payload.data();
          this.tareaEditando = this.document.data; // Cargar los datos del libro seleccionado
        } else {
          this.document.data = {} as ProyectoBiblioteca;
        }
      });
    }
  }

  isNew: boolean = false;

  document: any = {
    id:"",
    data: {} as ProyectoBiblioteca
  }
  
  idLibroSelec: string = '';

  clickBotonBorrar() {
    this.firestoreService.borrar('libros-samuel', this.id).then(() => {
      // Navegar de vuelta a la página principal
      this.router.navigate(['/home']);
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas borrar este elemento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Borrar',
          handler: () => {
            this.clickBotonBorrar();
          }
        }
      ]
    });

    await alert.present();
  }

  clicBotonGuardar() {
    if (this.isNew) {
      this.firestoreService.insertar('libros-samuel', this.tareaEditando).then(() => {
        console.log('Tarea creada correctamente!');
        // Limpiar el libro que se estaba editando
        this.tareaEditando = {} as ProyectoBiblioteca;
        // Navegar de vuelta a la página principal
        this.router.navigate(['/home']);
      }).catch((error: any) => {
        console.error('Error al crear la tarea: ', error);
      });
    } else {
      this.clicBotonModificar();
    }
  }

  clicBotonModificar() {
    this.firestoreService
      .actualizar('libros-samuel', this.id, this.tareaEditando)
      .then(() => {
        // Navegar de vuelta a la página principal
        this.router.navigate(['/home']);
      });
  }

  imagenSelec: string = "";

  async seleccionar() {
    // Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permiso de lecura se solicita al usuario
        if (result == false) {
          this.imagePicker.requestReadPermission();
        }
        else {
          // Abrir selector de imágenes
          this.imagePicker.getPictures({
            maximumImagesCount: 1, // Permitir solo 1 imagen
            outputType: 1 // 1 = Base64
          }).then(
            (results) => { // En la variable results se tienen las imágenes seleccionadas por el usuario
              if (results.length > 0) {
                // EN LA VARIABLE imagenSelec QUEDA ALMACENADA LA IMAGEN SELECCIONADA
                this.imagenSelec = 'data:image/jpeg;base64,' + results[0];
                console.log("Imagen que se ha seleccionado (en Base64): " + this.imagenSelec);
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async subirImagen() {
    // Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
    });
    // Mensaje de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'Imagen subida',
      duration: 3000
    });

    // Carpeta del Storage donde se almacenará la imagen
    let nombreCarpeta = "imagenes";

    // Mostrar el mensaje de espera
    loading.present();
    // Asignar el nombre de la imagen en función de la hora actual para evitar duplicidades
    let nombreImagen = `${new Date().getTime()}`;
    // Llamar al método que sube la imagen al Storage
    this.firestoreService.subirImagenBase64(nombreCarpeta, nombreImagen, this.imagenSelec)
    .then(snapshot => {
      snapshot.ref.getDownloadURL()
      .then(downloadURL => {
        // EN LA VARIABLE downloadURL SE OBTIENE LA DIRECCIÓN URL DE LA IMAGEN
        console.log("downloadURL: ", downloadURL);
        // Mostrar el mensaje de finalización de la subida
        toast.present();
        // Ocultar el mensaje de espera
        loading.dismiss();
    });
    })
  }

  async eliminarArchivo(fileURL:string) {
    const toast = await this.toastController.create({
      message: 'Archivo eliminado',
      duration: 3000
    });
    this.firestoreService.eliminarArchivo(fileURL)
    .then(() => {
      toast.present();
    }, (error) => {
      console.error(error);
    });
  }

}
