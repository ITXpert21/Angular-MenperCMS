import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';

import { SuccessOkDialogComponent } from '../dialogs/success-ok-dialog/success-ok-dialog.component';
import { ApproveRejectDialogComponent } from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  sub:any;
  mode:any;
  oobCode:any;
  apiKey:any;

  title = '';
  text='';
  code='';
  newPassword = '';
  confirmNewPassword = '';
  hideCodeInput=true;
  hidePasswordInput=true;
  hideYesVerifyEmailButton=true;
  hideNotMyEmailButton=true;
  hideSetPasswordButton = true;


  constructor(public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private httpClient:HttpClient, private route: ActivatedRoute,) { }

   ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.mode = params['mode']; 
      this.oobCode = params['oobCode']; 
      this.apiKey = params['apiKey']; 
      //console.log(params);

      if((this.oobCode != undefined) && (this.oobCode.length > 0)) {

        if ((this.mode != undefined) && (this.mode == 'verifyEmail')) {
          
          this.title='VERIFY YOUR EMAIL';
          this.hideCodeInput = true;
          this.hidePasswordInput = true;
          this.hideYesVerifyEmailButton = false;
          this.hideNotMyEmailButton = false;
          this.hideSetPasswordButton = true;

          this.afAuth.auth.checkActionCode(this.oobCode)
          .then((aObj) => {
            //console.log('checkActionCode response');
            //console.log(aObj);
            if ((aObj != undefined) && (aObj.data != undefined) && (aObj.data.email != undefined)) {
              this.text = "You have requested verification for following email.\n\n"+aObj.data.email+"\n\n\n\n";
            }
          })
          .catch((err) => {
            console.log(err);
            this.openDialog('Oops!',err.message);
            if ((err != undefined) && (err.code != undefined) && (err.code == "auth/expired-action-code")) {
              this.router.navigate(['login'], { replaceUrl: true });
            } else if ((err != undefined) && (err.code != undefined) && (err.code == "auth/invalid-action-code")) {
              this.router.navigate(['login'], { replaceUrl: true });
            }
          });
        } else if ((this.mode != undefined) && (this.mode == 'resetPassword')) {

          this.title='RESET YOUR PASSWORD';
          this.hideCodeInput = true;
          this.hidePasswordInput = false;
          this.hideYesVerifyEmailButton = true;
          this.hideNotMyEmailButton = true;
          this.hideSetPasswordButton = false;

          this.afAuth.auth.verifyPasswordResetCode(this.oobCode)
          .then((aObj) => {
            //console.log('verifyPasswordResetCode response');
            //console.log(aObj);
            this.text = "Please set new password for email\n\n"+aObj+"\n\n";
          })
          .catch((err) => {
            console.log(err);
            this.openDialog('Oops!',err.message);
            if ((err != undefined) && (err.code != undefined) && (err.code == "auth/expired-action-code")) {
              this.router.navigate(['login'], { replaceUrl: true });
            } else if ((err != undefined) && (err.code != undefined) && (err.code == "auth/invalid-action-code")) {
              this.router.navigate(['login'], { replaceUrl: true });
            }
          });

        } else {
          // This page does not support anything other than verify email and reset password
          // Hence redirecting to login page
          this.router.navigate(['login'], { replaceUrl: true });
        }

      } else {
        this.router.navigate(['login'], { replaceUrl: true });
      }
   });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  clickedYesVerifyEmailButton() {
    this.afAuth.auth.applyActionCode(this.oobCode)
    .then((aObj) => {
      //console.log('applyActionCode response');
      //console.log(aObj);
      this.openDialog('SUCCESS','Your email has been verified!');
      this.router.navigate(['login'], { replaceUrl: true });
    })
    .catch((err) => {
      console.log(err);
      this.openDialog('Error',err.message);
    });
  }

  clickedNotMyEmailButton() {
    this.router.navigate(['login'], { replaceUrl: true });
  }

  clickedSetPasswordButton() {

    if ((this.newPassword == undefined) || (this.confirmNewPassword == undefined) || 
    (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(this.newPassword)) || 
    (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(this.confirmNewPassword))) 
    {
      this.openDialog("Password not valid","Password and Confirm password should be Minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character.");
      return;
    }

    if (this.newPassword != this.confirmNewPassword) {
      this.openDialog("Password not valid","Password and Confirm password do not match.");
      return;
    }

    this.afAuth.auth.confirmPasswordReset(this.oobCode, this.newPassword)
    .then((aObj) => {
      this.openDialog('SUCCESS','Your password has been set successfully!');
      //this.router.navigate(['login'], { replaceUrl: true });
    })
    .catch((err) => {
      console.log(err);
      this.openDialog('Error',err.message);
    });
  }

  openDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle="OK";
    
  }

}
