import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationService } from '../services/pagination.service';

import { AngularFirestore } from 'angularfire2/firestore';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';

import { AddNewRoleComponent } from '../dialogs/add-new-role/add-new-role.component';
import { EditRoleComponent } from '../dialogs/edit-role/edit-role.component';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  categoryIdMap={};
  rolelist=[]

  role = {
    name: '',
  };
  isLoading=false;

  private roleSubscription: Subscription;
  private loadingSubscription:Subscription


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private firestore: AngularFirestore,
    public page: PaginationService
  ) { }

  ngOnInit() {
    this.updateRoleList();
  }

  // scrollHandler(e) {
  //   // should log top or bottom
  //   console.log("Reached Bottom")
  //   if (e === 'bottom' && !this.isLoading) {
  //     console.log("Actual Loading started");
  //      this.page.more();
      
  //   }
  // }

  ngOnDestroy() {

    if (this.roleSubscription != undefined){
      this.roleSubscription.unsubscribe();
    }

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
      // console.log(this.rolelist);
    });
     
   }
   

  addNewRoleClick(): void{
    var aRole = {name:''}
    const dialogRef = this.dialog.open(AddNewRoleComponent, {
      width: '600px',
      data: {role: aRole}
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed: ${result}`);
    });
  }

  EditRoleClick(aRole){
    const dialogRef = this.dialog.open(EditRoleComponent, {
      width: '600px',
      data: {role: aRole}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  
  DeleteRoleClick(role:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',

    });
    dialogRef.componentInstance.title = 'DELETE ROLE';
    dialogRef.componentInstance.descr = "Please remove the user(s) that belongs to "+ role.name +" first!";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.firestore.collection('role').doc(role.id).delete()
        .then(() => {
          // user created. now create profile in firestore.
          this.openInformDialog("SUCCESS","Role removed successfully.");
          // var index=this.rolelist.indexOf(role)
          // this.rolelist.splice(index,1)

        })
        .catch((error) => {
          console.log("Error", error);
          this.openInformDialog("Error", error.message);
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
