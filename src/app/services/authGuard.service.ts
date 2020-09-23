// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
// import { of } from 'rxjs';
// import { AuthService } from '../services/auth.service';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { AngularFirestore } from 'angularfire2/firestore';

// import { map, take, tap } from 'rxjs/operators';

// @Injectable()

// export class AuthGuard implements CanActivate {
//     constructor(private authService: AuthService, private router: Router, private afAuth: AngularFireAuth, 
//       private firestore: AngularFirestore) {}
  
//     isValidAuthProfile(aprofile){
//       if ((aprofile != undefined) && (aprofile != null) &&
//       (aprofile.profileType != undefined) && 
//       (aprofile.profileType == 'user'))
//       {
//         return true;
//       }
//     }
//     canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean>
//     {
//       //console.log('AdminGuard:canActivate');
//       //console.log(this.authService.loggedInProfile);
  
//       if (this.isValidAuthProfile(this.authService.loggedInProfile)) 
//       {
//         //return of(true);
//         return new Promise((resolve) => {
//           resolve(true);
//         });
//       } else {
//         if((this.authService.loggedInProfile != undefined)) {
//           this.router.navigate(['/login']);
//           //return of(false);
//           return new Promise((resolve) => {
//             resolve(false);
//           });
//         }
  
//         return new Promise((resolve) => {
//           // //wait for AuthService to finish initialization
//           // setTimeout(() => {
//           //   if (this.isValidAuthProfile(this.authService.loggedInProfile)) 
//           //   {
//           //     resolve(true);
//           //   } else {
//           //     this.router.navigate(['/Admin_login']);
//           //     resolve(false);
//           //   }
//           // }, 4000);
  
//           this.afAuth.authState.pipe(take(1)).subscribe((auser) => {
//             if((auser != undefined) && (auser != null) && (auser.uid != undefined ) && (auser.uid != null )){
//               //console.log(auser);
//               this.firestore.collection('user').doc(auser.uid).ref.get()
//               .then((adoc) => {
//                 if (!adoc.exists) { 
//                   this.router.navigate(['/login']);
//                   resolve  (false);
//                 }
//                 var aprofile = adoc.data();
//                 aprofile.id = auser.uid;
//                 if (this.isValidAuthProfile(aprofile)) 
//                 {
//                   resolve(true);
//                 }
//               })
//               .catch((err) => {
//                 this.router.navigate(['/login']);
//                 resolve(false);
//               });
//             } else {
//               this.router.navigate(['/login']);
//               resolve(false);
//             }
//           });
//         });
        
//       }
//     }
  
//     canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//       return this.canActivate(route, state);
//     }  
//   }

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { map, take, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private afAuth: AngularFireAuth, 
    private firestore: AngularFirestore) {}

  isValidAdminProfile(aprofile){
    // if ((aprofile != undefined) && (aprofile != null) &&
    // (aprofile.profileType != undefined) && 
    // ((aprofile.profileType == 'adminsuper') || 
    // (aprofile.profileType == 'user') || 
    // (aprofile.profileType == 'admin')))
    if ((aprofile != undefined) && (aprofile != null) && (aprofile.role_id == 1))    
    {
      return true;
    }
  }
  canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean>
  {
    //console.log('AuthGuard:canActivate');
    //console.log(this.authService.loggedInProfile);

    if (this.isValidAdminProfile(this.authService.loggedInProfile)) 
    {
      //return of(true);
      return new Promise((resolve) => {
        resolve(true);
      });
    } else {
      if((this.authService.loggedInProfile != undefined)) {
        this.router.navigate(['/login']);
        //return of(false);
        return new Promise((resolve) => {
          resolve(false);
        });
      }

      return new Promise((resolve) => {
        // //wait for AuthService to finish initialization
        // setTimeout(() => {
        //   if (this.isValidAuthProfile(this.authService.loggedInProfile)) 
        //   {
        //     resolve(true);
        //   } else {
        //     this.router.navigate(['/login']);
        //     resolve(false);
        //   }
        // }, 4000);

        this.afAuth.authState.pipe(take(1)).subscribe((auser) => {
          if((auser != undefined) && (auser != null) && (auser.uid != undefined ) && (auser.uid != null )){
            //console.log(auser);
            this.firestore.collection('user').doc(auser.uid).ref.get()
            .then((adoc) => {
              if (!adoc.exists) { 
                this.router.navigate(['/login']);
                resolve  (false);
              }
              var aprofile = adoc.data();
              aprofile.id = auser.uid;
              if (this.isValidAdminProfile(aprofile)) 
              {
                resolve(true);
              }
            })
            .catch((err) => {
              this.router.navigate(['/login']);
              resolve(false);
            });
          } else {
            this.router.navigate(['/login']);
            resolve(false);
          }
        });
      });
      
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.canActivate(route, state);
  }  
}