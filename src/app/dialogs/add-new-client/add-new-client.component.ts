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
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';

@Component({
  selector: 'app-add-new-client',
  templateUrl: './add-new-client.component.html',
  styleUrls: ['./add-new-client.component.css']
})
export class AddNewClientComponent implements OnInit {

  salepersonlist=[];
  
  client:any = {
    accountnumber:'',
    name:'',
    address:'',
    email:'',
    phone:''
  }

  private salesSubscription: Subscription;
  selectedSalesperson:any;

  constructor(fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<AddNewClientComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:string
    ) { 
     
    }

  cancelClick() {
      this.dialogRef.close();
  }

  updateSalepersonList () {
    var aCollection = this.firestore.collection('user', ref => 
    //ref.where('role_id','==','2')
    ref.where('is_active','==','Y'));
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
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
    if(this.client.accountnumber == undefined || (this.client.accountnumber.length < 1)) {
      this.openInformDialog("Account number not specified", "Please enter a valid account number.");
      return;
    }
    if(this.client.name == undefined || (this.client.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }
    if ((this.client.address == undefined) || (this.client.address.length < 1)) {
      this.openInformDialog("Address not specified","Please enter a valid address.");
      return;
    }
    if ((this.client.phone == undefined) || (this.client.phone.length < 1)) {
      this.openInformDialog("Phone number not specified","Please enter a valid Phone number.");
      return;
    }
    if ((this.client.phone == undefined) || (this.client.phone.length < 10)) {
      this.openInformDialog("Invalid","Phone number should be minimum 10 digits.");
      return;
    }
    if(this.client.email == undefined || (this.client.email.trim().length < 3 )) {
      this.openInformDialog("Email not specified", "Please enter a valid email.");
      return;
    }
    if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.client.email)) {
      this.openInformDialog("Invalid","Please enter a valid email.");
      return;
    }

    this.firestore.collection("client").add({
      account_number: this.client.accountnumber,
      address: this.client.address,
      create_by: this.authService.loggedInProfile.userId,
      create_time: firebase.firestore.FieldValue.serverTimestamp(),
      email:this.client.email,
      is_active:"Y",
      name: this.client.name,
      phone: this.client.phone,
      update_by:null,
      update_time:null,
      user_id: this.selectedSalesperson.id,
    })
    .then(async (aObj) => {
      // console.log(aObj);
      this.client.id = aObj.id;
      this.firestore.collection('client').doc(this.client.id)
      .set({
          id: this.client.id
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
      this.openInformDialog("SUCCESS", "Client added successfully.");
      this.router.navigate(['client']);
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

  clickOnReset(){
    this.client.accountnumber='';
    this.client.name = '';
    this.client.address = '';
    this.client.email='';
    this.client.phone ='';
    this.selectedSalesperson = undefined;
  } 

  ngOnInit() {
    this.updateSalepersonList();
  }

  ngOnDestroy() {

    if (this.salesSubscription != undefined){
      this.salesSubscription.unsubscribe();
    }
    
  }


}

