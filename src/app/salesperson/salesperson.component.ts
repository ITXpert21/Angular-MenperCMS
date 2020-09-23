import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { PaginationService } from '../services/pagination.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';

import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';

import { AddNewSalesComponent } from '../dialogs/add-new-sales/add-new-sales.component';
import { EditSalesComponent } from '../dialogs/edit-sales/edit-sales.component';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { ApproveRejectDialogComponent } from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { AppHelpers } from '../globals/menperhelpers';

@Component({
  selector: 'app-salesperson',
  templateUrl: './salesperson.component.html',
  styleUrls: ['./salesperson.component.css']
})
export class SalespersonComponent implements OnInit {
  sortSalesPerson='';
  salespersonlist=[];
  userList=[];
  salesperson: {
    name: '',
    address: '',
    email: '',
    phone: ''
  }
  isLoading=false;
  showSpinner: boolean = true;
  
  sub:any;
  userId :any;

  private salespersonSubscription: Subscription;
  private loadingSubscription:Subscription


  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore,
    public page: PaginationService,
    private route: ActivatedRoute,
    private httpClient:HttpClient,

  ) { }

  ngOnInit() {
    this.updateSalepersonList();
  
  }


  ngOnDestroy() {

    if (this.salespersonSubscription != undefined){
      this.salespersonSubscription.unsubscribe();
    }
    
  }

  updateSalepersonList(){
    var aCollection = this.firestore.collection('user');
    this.salespersonSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(alist => {
        // // this.salespersonlist = alist;
        this.userList = alist
        let tempUserList=[]
        this.userList.forEach(item=>{
            if(item.role_id == '2') {
              tempUserList.push(item)
            }
        })
        this.salespersonlist = this.userList;
        this.salespersonlist.sort((a, b) => (a.name > b.name) ? 1 : -1)
        this.showSpinner = false;

    });
     
  }

  addNewSalesClick(): void{
    const dialogRef = this.dialog.open(AddNewSalesComponent, {
      width: '600px',
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed: ${result}`);
      console.log(this.salespersonlist);
      //this.updateSalepersonList();
    });
  }

  EditSalesClick(aSalesperson){
    const dialogRef = this.dialog.open(EditSalesComponent, {
      width: '600px',
      data: {salesperson: aSalesperson}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }



  DeleteSalesClick(salesperson:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',

    });
    dialogRef.componentInstance.title = 'DELETE USER';
    dialogRef.componentInstance.descr = "Please remove the client(s) that belongs to " +salesperson.name +" first!";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.removeSaleperson(salesperson);
      }
    });
  }

  removeSaleperson(salesperson){

    var deleteUser = firebase.functions().httpsCallable('deleteUser');

    var user = {
      uid: salesperson.id
    };

    deleteUser(user).then((resp) =>{
        this.openInformDialog("SUCCESS","Saleperson deleted successfully.");
        this.updateSalepersonList();
      })
      .catch((error) => {
        console.log("Error", error);
        this.openInformDialog("Error", error.message);
      //Display error
      });
  }

  activeSalesClick(salesperson:any): void {
    var dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = 'Are you sure?';
    dialogRef.componentInstance.descr = 
    "Do you really want to active this salesperson?";

    dialogRef.componentInstance.approveTitle = 'Yes, Active';
    dialogRef.componentInstance.rejectTitle = 'No, Cancel';
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.approveTitle) {
        this.firestore.collection('user').doc(salesperson.id).set({
          is_active: 'Y',
        }, {merge: true})
        .then(() => {
          // user activated. now create profile in firestore.
          this.openInformDialog("SUCCESS","Salesperson activated successfully.");
        })
        .catch((err) => {
          console.log("Error", err);
          this.openInformDialog("Error",err.message);
        });
      }
    });

  }

  inactiveSalesClick(salesperson:any): void {
    var dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = 'Are you sure?';
    dialogRef.componentInstance.descr = 
    "Do you really want to inactive this salesperson?";

    dialogRef.componentInstance.approveTitle = 'Yes, Inactive';
    dialogRef.componentInstance.rejectTitle = 'No, Cancel';
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.approveTitle) {
        this.firestore.collection('user').doc(salesperson.id).set({
          is_active: 'N',
        }, {merge: true})
        .then(() => {
          // user deactivated. now create profile in firestore.
          this.openInformDialog("SUCCESS","Salesperson inactivated successfully.");
        })
        .catch((err) => {
          console.log("Error", err);
          this.openInformDialog("Error",err.message);
        });
      }
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

}
