import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProyectoBiblioteca } from './proyecto-biblioteca';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore, private angularFireStorage: AngularFireStorage) { }

  insertar(coleccion: string, datos: ProyectoBiblioteca) {
    return this.firestore.collection(coleccion).add(datos);
  }

  consultar(coleccion: string) {
    return this.firestore.collection(coleccion).snapshotChanges();
  }

  consultarPorId(coleccion: string, id: string) {
    return this.firestore.collection(coleccion).doc(id).snapshotChanges();
  }

  actualizar(coleccion: string, id: string, datos: ProyectoBiblioteca) {
    return this.firestore.collection(coleccion).doc(id).set(datos);
  }

  borrar(coleccion: string, id: string) {
    return this.firestore.collection(coleccion).doc(id).delete();
  }

  subirImagenBase64(nombreCarpeta:string, nombreArchivo:string, imagenBase64:string) {
    let storageRef = this.angularFireStorage.ref(nombreCarpeta).child(nombreArchivo);
    return storageRef.putString(imagenBase64, 'data_url');
  }

  eliminarArchivo(url:string) {
    return this.angularFireStorage.storage.refFromURL(url).delete();
  }
}
