import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { SuccessOkDialogComponent } 
from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent implements OnInit {
  category: any;

  constructor(fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditCategoryComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
      console.log(data);
      this.category = data.category;
    }

  ngOnInit() {
  }

  clickOnSave(){
    // if (this.shift.subcategory == undefined) {
    //   this.openInformDialog("Subcategory not specified","Please select a valid subcategory.");
    //   return;
    // }
    // this.dialogRef.close();

    if(this.category.name == undefined || (this.category.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }

    this.firestore.collection("category").doc(this.category.id).set({
      name:this.category.name,
      update_by:this.authService.loggedInProfile.userId,
      update_time:firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge: true})
    .then(async (aObj) => {
      this.dialogRef.close();
      this.openInformDialog("SUCCESS", "Name updated successfully.");
      this.router.navigate(['category']);
      await AppHelpers.handleCacheChange();
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
