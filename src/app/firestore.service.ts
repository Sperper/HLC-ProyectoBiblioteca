import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private angularFirestore: AngularFirestore) { }

  public insertar(coleccion: any, datos: any) {
    return this.angularFirestore.collection(coleccion).add(datos);
  }

  public consultar(coleccion: any) {
    return this.angularFirestore.collection(coleccion).snapshotChanges();
  }
}
