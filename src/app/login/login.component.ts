import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators }from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';
import { ApproveRejectDialogComponent } 
from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';

import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../services/authGuard.service';

//import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';

import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email='';
  public password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public dialog: MatDialog,
    private authGuard: AuthGuard,) { }

  ngOnInit() {
    this.authGuard.canActivate(null,null)
    .then((val) => {
      //console.log('adminGuard.canActivate returned '+val);
      if (val == true) {
        // User already logged-in why, show the login page
        this.router.navigate(['category']);
      }
    });
  }

  onPasswordRecoveryClick(){
    this.router.navigate(['password-recovery']);
  }

  onLoginClick(){
    // For Empty email and password
    if ((this.email.trim().length < 1 && this.password.length < 1)) {
      this.openDialog('Invalid', "Please enter a valid email address and password.");
      return;
    }

   // For Empty email or lessthan 3 character
    if ((this.email == undefined) || (this.email.length < 3)) {
      this.openDialog('Invalid', "Please enter a valid email address.");
      return;
    }

    // For Empty password or lessthan 6 character
    if ((this.password == undefined) || (this.password.length < 6)) {
      this.openDialog('Invalid', "Password should be minimum 6 characters.");
      return;
    }

    this.authService.doLogin(this.email.trim().toLowerCase(), this.password)
   .then((auser) => {
     console.log(auser);
     if((auser != undefined) && (auser.uid != undefined )){
       console.log('checking if email verified');
      //  if ((auser.emailVerified == false) && (this.email.trim().toLowerCase() != 'admin@menper.com')) {
        if (auser.emailVerified == false) {
         // Well well email NOT verified.

         const dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
           width: '600px',
         });
         dialogRef.componentInstance.title = 'Email not verified';
         dialogRef.componentInstance.descr = 
         "Your email address "+auser.email+" has not been verified yet.\n"+
         "Choose 'Start Verification' so that we can send you an email with verification link.\n"+
         "You can then open the verification link from your mailbox and follow the instructions.";

         dialogRef.componentInstance.approveTitle = 'Start Verification';
         dialogRef.componentInstance.rejectTitle = 'Cancel';

         dialogRef.afterClosed().subscribe(result => {
           console.log(`The dialog was closed: ${result}`);

           if (result == dialogRef.componentInstance.approveTitle) {
             firebase.auth().currentUser.sendEmailVerification()
             .then(() => {
               this.openDialog("Verification link sent",
               "An email with verification link has been sent to your email address "+auser.email);
               this.authService.doLogout().then().catch();
             })
             .catch((err) => {
               this.authService.doLogout().then().catch();
               console.log(err);
               this.openDialog('Error',err.message);
             });

           } else {
             this.authService.doLogout().then().catch();
             return;
           }
         });


       } else {
         console.log('email is verified');
         this.firestore.collection('user').doc(auser.uid).ref.get()
         .then((adoc) => {
           if (!adoc.exists) { 
             this.openDialog('Error', 'Account has been deleted. Contact support.');
             return; 
           }
           var aprofile = adoc.data();
           aprofile.id = adoc.id;

          //  console.log("Fetching Here1");
           console.log("1234567890", aprofile);
           //aprofile:Profile = aObject as Profile;
           if(aprofile != undefined){
            if(aprofile.role_id == 2){
              //dialog 
              this.openDialog('Error', "You don't have access to this portal. Please login from the menper app.");
              this.authService.doLogout().then().catch();
              return;
            }
            
            this.router.navigate(['category']);
            
            console.log("login successfully!");
            }
          this.router.navigate(['category']);

         }).catch((err) => {
           console.log(err);
           this.openDialog('Error', err.message);
         });
       }
     }
   })
   .catch((err) => {
     console.log(err);
     this.openDialog('Error', err.message);
   });
  }

  

  openDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle = "OK";
  }

}
