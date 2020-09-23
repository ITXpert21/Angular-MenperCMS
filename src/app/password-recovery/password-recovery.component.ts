import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators }from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css']
})
export class PasswordRecoveryComponent implements OnInit {

  email = '';
  sub:any;
  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private authService: AuthService, 
    private afAuth: AngularFireAuth, 
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
  }


  onLoginClick(){
    this.router.navigate(['login']);
  }


  onSendClick(){
    if((this.email == undefined) || (this.email.length < 1)) {
      return;
    }
    firebase.auth().sendPasswordResetEmail(this.email)
    .then(() => {
      this.openDialog('SUCCESS','\nPassword reset code has been sent.\nPlease check your email and follow the instructions.\n');
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
    dialogRef.componentInstance.buttonTitle="OK";
    
  }
  

}
