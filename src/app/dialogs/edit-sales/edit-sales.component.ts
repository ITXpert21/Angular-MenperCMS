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
import { HttpClient, HttpParams } from '@angular/common/http';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-edit-sales',
  templateUrl: './edit-sales.component.html',
  styleUrls: ['./edit-sales.component.css']
})
export class EditSalesComponent implements OnInit {
  salesperson: any;
  selectedRole:any;
  repassword:any;
  rolelist=[];
  private roleSubscription: Subscription;

  constructor(fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    private httpClient: HttpClient,
    public dialogRef: MatDialogRef<EditSalesComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
      this.salesperson = data.salesperson;
      this.repassword = this.salesperson.password;
    }

  ngOnInit() {
    this.updateRoleList();
  }

  updateRoleList(){
    var aCollection = this.firestore.collection('role');
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
    this.roleSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(rolelist => {
      this.rolelist = rolelist;
      let roleId = this.salesperson.role_id
      this.rolelist.forEach(role=>{
        if(role.id == roleId){
          // console.log(role)
          this.selectedRole=role
        }
        // console.log(this.selectedRole)
      })
      // rolelist.forEach(element => {
      //   this.rolelist.push(element);
      // });
    
    });
     
   }

  clickOnSave(){

    if(this.salesperson.name == undefined || (this.salesperson.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }
    if ((this.salesperson.address == undefined) || (this.salesperson.address.length < 1)) {
      this.openInformDialog("Address not specified","Please enter a valid address.");
      return;
    }
    if ((this.salesperson.phone == undefined) || (this.salesperson.phone.length < 10)) {
      this.openInformDialog("Phone number not specified","Please enter a valid Phone number.");
      return;
    }
    if(this.repassword != this.salesperson.password){
      this.openInformDialog("No matched password.");
      return;
    }
    this.salesperson.role_id = this.selectedRole.id;
    this.salesperson.password = this.repassword;

    var updateUser = firebase.functions().httpsCallable('updateUser');
 
    updateUser(this.salesperson).then((resp) =>{
        this.dialogRef.close();
        this.openInformDialog("SUCCESS","Saleperson added successfully.");
    }).catch((error) => {
        console.log("Error", error);
        this.openInformDialog("Error", error.message);
      //Display error
      });

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
