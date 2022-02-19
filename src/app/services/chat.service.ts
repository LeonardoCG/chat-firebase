import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

import { Mensaje } from '../interface/mensaje.inteface';
import { map } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable()
export class ChatService {

  private itemsCollection!: AngularFirestoreCollection<any>;

  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(public auth: AngularFireAuth, 
              private afs: AngularFirestore) { 

    // escuchamos los cambios 
    this.auth.authState.subscribe( user => {

      console.log( 'Estado del usuario: ', user );

      if( !user ) {
        return;
      }

      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
      
    })            
  }

  login( proveedor : string ) {

    if( proveedor === 'google' ){
      
      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    } else {

      this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

    }
  }

  logout() {
    // reestablecer el usuario 
    this.usuario = {};
    this.auth.signOut();
  }


  cargarMensajes() {

    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc')
                                                                            .limit(5) );

    return this.itemsCollection.valueChanges()
                                .pipe(map( (mensajes: Mensaje[]) => {
                                  console.log( mensajes );

                                  this.chats = [];

                                  for(let mensaje of mensajes ) {
                                    this.chats.unshift( mensaje );
                                  }
                                  return this.chats;
                                }))
  }

  agregarMensaje( texto: string )
 {
   let mensaje: Mensaje = {
     nombre: 'Demo',
     mensaje: texto,
     fecha: new Date().getTime(),
     uid: ''
   }

   return this.itemsCollection.add( mensaje );
 }
}
