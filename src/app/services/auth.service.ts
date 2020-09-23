import { Injectable, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { map } from 'rxjs/operators';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

    // persist observable
    private userAuthState: Observable<firebase.User>;
    public firebaseAuthUserData: any = undefined;
    public loggedInProfile: any = undefined;
  
    constructor(private _firebaseAuth: AngularFireAuth, private router: Router, private firestore: AngularFirestore){
      this.loggedInProfile = undefined;
      this.userAuthState = _firebaseAuth.authState;
      this.userAuthState.subscribe((auser) => {
        //console.log(auser);
        this.firebaseAuthUserData = auser;
        if((auser != undefined) && (auser != null) && (auser.uid != undefined ) && (auser.uid != null )){
          //console.log('from constructor');
          //console.log(auser);
          const aCollection = this.firestore.collection<any>('user');
          aCollection.doc(auser.uid).snapshotChanges().pipe(
            map(action => {
              const data = action.payload.data();
              const id = action.payload.id;
              return { id, ...data };
            })
          ).subscribe(aprofile => {
            //console.log('AuthService: Updated profile:');
            
            this.loggedInProfile = aprofile;
            //console.log(this.loggedInProfile);
          });
        } else {
          //console.log('AuthService: Profile reset to undefined');
          this.loggedInProfile = undefined;
        }
      });
    }
  
    ngOnInit() {
    }
  
    ngOnDestroy(){
      //console.log('AuthService: ngOnDestroy CALLED. SHUTTING DOWN!!');
      this._firebaseAuth.authState.subscribe().unsubscribe();
    }
   
    
    // For User Login
    doLogin(email, password){
      return new Promise<any>((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(res => {
          //console.log('doLogin');
          //console.log(res);
          resolve(res.user);
        }, err => reject(err))
      })
    }
  
    // For User Logout
    doLogout(){
      return new Promise<any>((resolve, reject) => {
        firebase.auth().signOut()
        .then(res => {
         // console.log(res);
          // return undefined
          resolve(res);
          this.loggedInProfile = undefined;
        }, err => reject(err))
      })
    }
  
    // For User Register
    doRegister(email, password){
      return new Promise<any>((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(res => {
          //console.log(res.user.uid);
          resolve(res);
        }, err => reject(err))
      })
    }
  

}
