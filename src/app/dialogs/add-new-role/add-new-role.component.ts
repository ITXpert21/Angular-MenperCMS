import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { SuccessOkDialogComponent } from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-new-role',
  templateUrl: './add-new-role.component.html',
  styleUrls: ['./add-new-role.component.css']
})
export class AddNewRoleComponent implements OnInit {

  role:any = {
    name:'',
  }

  constructor(fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<AddNewRoleComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:string
    ) { 
     
    }

  cancelClick() {
    this.dialogRef.close();
  }

  clickOnSave(){
    if(this.role.name == undefined || (this.role.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }

    this.firestore.collection("role").add({
      name:this.role.name,
      create_by: this.authService.loggedInProfile.userId,
      create_time:firebase.firestore.FieldValue.serverTimestamp(),
      update_by:null,
      update_time:null,
    })
    .then((aObj) => {
      this.role.id = aObj.id;
      this.firestore.collection('role').doc(this.role.id)
      .set({
          id: this.role.id
      },{merge: true})
        .then(() => {
          // this.dialogRef.close();
          // this.openInformDialog("SUCCESS","Category added successfully.");
        })
        .catch((error) => {
          console.log("Error", error);
          this.openInformDialog("Error", error.message);
        });
      this.dialogRef.close();
      this.openInformDialog("SUCCESS", "Role added successfully.");
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

  clickOnReset(){
    this.role.name = '';
  } 

  ngOnInit() {
  }

}
