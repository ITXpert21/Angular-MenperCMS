import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { SuccessOkDialogComponent } 
from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../services/auth.service';
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.css']
})
export class EditRoleComponent implements OnInit {
  role: any;

  constructor(fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    public authService: AuthService,
    private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<EditRoleComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
      console.log(data);
      this.role = data.role;
    }

  ngOnInit() {
  }

  clickOnSave(){
    
    if(this.role.name == undefined || (this.role.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }

    this.firestore.collection("role").doc(this.role.id).set({
      name:this.role.name,
      update_by: this.authService.loggedInProfile.userId,
      update_time: firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge: true})
    .then((aObj) => {
      this.dialogRef.close();
      this.openInformDialog("SUCCESS", "Name updated successfully.");
    })
    .catch(err=> {
      console.log(err);
      this.dialogRef.close();
      this.openInformDialog("Error", err.message);
    })

  }

  openInformDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle="OK";
      
  }

  cancelClick() {
    this.dialogRef.close();
  }

}
