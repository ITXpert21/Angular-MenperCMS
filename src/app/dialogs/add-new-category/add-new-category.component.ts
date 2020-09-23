import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription, Observer } from 'rxjs';
import { map, max, take } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';
import { AuthService } from '../../services/auth.service';

// import { ApproveRejectDialogComponent } from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { SuccessOkDialogComponent } from '../../dialogs/success-ok-dialog/success-ok-dialog.component';

@Component({
  selector: 'app-add-new-category',
  templateUrl: './add-new-category.component.html',
  styleUrls: ['./add-new-category.component.css']
})
export class AddNewCategoryComponent implements OnInit {

  category:any = {
    name:'',
  }
  public onItemAdded:Observable<String>;
  
  constructor(private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<DocumentReference>,
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
    }


  clickOnSave(){
    if(this.category.name == undefined || (this.category.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }
    
    this.firestore.collection("category").add({
      create_by: this.authService.loggedInProfile.userId,
      create_time: firebase.firestore.FieldValue.serverTimestamp(),
      // id:this.categoryId,
      name:this.category.name,
      update_by:null,
      update_time:null,
    })
    .then(async(aObj) => {
      // console.log(aObj);
      this.category.id = aObj.id;
      this.firestore.collection('category').doc(this.category.id)
      .set({
          id: this.category.id
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
        this.openInformDialog("SUCCESS","Category added successfully.");
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

  clickOnReset(){
    this.category.name = '';
  }  

  ngOnInit() {
    
  }

  

}
