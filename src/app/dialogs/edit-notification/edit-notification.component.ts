import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { SuccessOkDialogComponent } 
from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Component({
  selector: 'app-edit-notification',
  templateUrl: './edit-notification.component.html',
  styleUrls: ['./edit-notification.component.css']
})
export class EditNotificationComponent implements OnInit {
  // notification: any;
  commonnotices: any;


  constructor(fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<EditNotificationComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
      console.log(data);
      this.commonnotices = data.commonnotices;
    }

  ngOnInit() {
  }

  clickOnSave(){
    // if (this.shift.subcategory == undefined) {
    //   this.openInformDialog("Subcategory not specified","Please select a valid subcategory.");
    //   return;
    // }
    // this.dialogRef.close();

    if(this.commonnotices.title == undefined || (this.commonnotices.title.length < 1)) {
      this.openInformDialog("Title not specified", "Please enter a valid  title.");
      return;
    }

    if(this.commonnotices.notificationText == undefined || (this.commonnotices.notificationText.length < 1)){
      this.openInformDialog("Notification text not specified", "Please enter a valid Notification text.");
      return;
    }

    this.firestore.collection("commonnotices").doc(this.commonnotices.doc.id).set({
      title:this.commonnotices.title,
      notificationText:this.commonnotices.notificationText
    }, {merge: true})
    .then((aObj) => {
      this.dialogRef.close();
      this.openInformDialog("SUCCESS", "Notification updated successfully.");
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

  clickOnReset(){
    this.commonnotices.title = '';
  }

}
