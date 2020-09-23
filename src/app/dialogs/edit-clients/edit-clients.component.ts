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
import { async } from 'q';

@Component({
  selector: 'app-edit-clients',
  templateUrl: './edit-clients.component.html',
  styleUrls: ['./edit-clients.component.css']
})
export class EditClientsComponent implements OnInit {
  client: any;
  salepersonlist=[];
  selectedSalesperson:any;

  private salesSubscription: Subscription;

  constructor(fb: FormBuilder,
    private router: Router,
    public authService: AuthService,
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditClientsComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any
    ) { 
      console.log(data);
      this.client = data.client;
      
      if(this.client.salesperson != undefined)
        this.selectedSalesperson = this.client.salesperson.id;
      if(this.client.salesperson == undefined){
        this.selectedSalesperson = "";
      }  
      console.log(this.selectedSalesperson);    
    }

  ngOnInit() {
    this.updateSalepersonList();
  }

  ngOnDestroy() {

    if (this.salesSubscription != undefined){
      this.salesSubscription.unsubscribe();
    }
    
  }

  selectSalesPerson(val){
    console.log(val);
    this.selectedSalesperson = val;
  }

  updateSalepersonList () {
    var aCollection = this.firestore.collection('user', ref => 
    //ref.where('role_id','==','2')
    ref.where('is_active','==','Y'));
    
    this.salesSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(salepersonlist => {
      this.salepersonlist = salepersonlist;
      // console.log(this.salepersonlist);
    });
  }

  clickOnSave(){
    if ((this.selectedSalesperson == undefined) || (this.selectedSalesperson.length < 1)) {
      this.openInformDialog("Sales Person not specified","Please enter a valid Sales Person.");
      return;
    }
    if(this.client.account_number == undefined || (this.client.account_number.length < 1)) {
      this.openInformDialog("Account number not specified", "Please enter a valid accountnumber.");
      return;
    }

    if(this.client.name == undefined || (this.client.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }

    if(this.client.address == undefined || (this.client.address.length < 1)) {
      this.openInformDialog("Address not specified", "Please enter a valid address.");
      return;
    }

    // if(this.client.phone == undefined || (this.client.phone.length < 1)) {
    //   this.openInformDialog("Name not specified", "Please enter a valid phone.");
    //   return;
    // }
    if ((this.client.phone == undefined) || (this.client.phone.length < 1)) {
      this.openInformDialog("Phone number not specified","Please enter a valid Phone number.");
      return;
    }
    if ((this.client.phone == undefined) || (this.client.phone.length < 10)) {
      this.openInformDialog("Invalid","Phone number should be minimum 10 digits.");
      return;
    }

    if(this.client.email == undefined || (this.client.email.trim().length < 3)) {
      this.openInformDialog("Email not specified", "Please enter a valid email.");
      return;
    }
    if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.client.email)) {
      this.openInformDialog("Invalid","Please enter a valid email.");
      return;
    }
    this.firestore.collection("client").doc(this.client.id).set({
      account_number: this.client.account_number,
      name:this.client.name,
      address:this.client.address,
      phone:this.client.phone,
      email:this.client.email,
      // user_id:this.client.user_id,
      user_id:this.selectedSalesperson,
      update_by: this.authService.loggedInProfile.userId,
      update_time: firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge: true})
    .then(async (aObj) => {
      this.dialogRef.close();
      this.openInformDialog("SUCCESS", "Client updated successfully.");
      //navigate to client
      //this.router.navigate(['client']);
      //await AppHelpers.handleCacheChange();
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
