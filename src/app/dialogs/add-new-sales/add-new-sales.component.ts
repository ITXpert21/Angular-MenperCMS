import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { SuccessOkDialogComponent } from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import axios from "axios";
@Component({
  selector: 'app-add-new-sales',
  templateUrl: './add-new-sales.component.html',
  styleUrls: ['./add-new-sales.component.css']
})
export class AddNewSalesComponent implements OnInit {

  user: any = {
    name: '',
    password: '',
    repassword: '',
    address: '',
    email: '',
    phone: ''
  }
  userId: any;
  sub: any;
  selectedRole: any;
  rolelist = [];

  private roleSubscription: Subscription;

  constructor(fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private httpClient: HttpClient,
    public dialogRef: MatDialogRef<AddNewSalesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {

  }

  cancelClick() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.updateRoleList();
  }



  updateRoleList() {
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

  clickOnSave() {
    if (this.user.name == undefined || (this.user.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid name.");
      return;
    }
    if ((this.selectedRole == undefined) || (this.selectedRole.length < 1)) {
      this.openInformDialog("Role not specified", "Please select a valid Role.");
      return;
    }
    if (this.user.email == undefined || (this.user.email.length < 1)) {
      this.openInformDialog("Email not specified", "Please enter a valid email.");
      return;
    }
    if ((this.user.password == undefined) || (this.user.password.length < 6)) {
      this.openInformDialog("Password not valid", "Password should be minimum 6 chars long.");
      return;
    }
    if ((!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(this.user.password))) {
      this.openInformDialog('Password', "Password should be Minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character.");
      return;
    }
    if (this.user.repassword == undefined || (this.user.repassword.length < 1)) {
      this.openInformDialog("Password not specified", "Please enter a valid re-type password.");
      return;
    }
    if ((this.user.repassword.length > 0) && (this.user.password != this.user.repassword)) {
      this.openInformDialog("Password not specified", "Password and re-type password should match.");
      return;
    }

    var createUser = firebase.functions().httpsCallable('createUser');

    var user = {
      address: this.user.address,
      create_by: this.authService.loggedInProfile.userId,
      create_time: firebase.firestore.FieldValue.serverTimestamp(),
      email:this.user.email,
      password : this.user.repassword,
      is_active:"Y",
      name: this.user.name,
      role_id:this.selectedRole.id,    
      phone: this.user.phone,
      userId : "",
      update_by:null,
      update_time:null
    };

    createUser(user).then((resp) =>{
        this.dialogRef.close();
        this.openInformDialog("SUCCESS","Saleperson added successfully.");
    })
      .catch((error) => {
        console.log("Error", error);
        this.openInformDialog("Error", error.message);
      //Display error
      });
  }


  openInformDialog(title = '', msg = ''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle = "OK";

  }

  clickOnReset() {
    this.user.name = '';
    this.user.password = '';
    this.user.repassword = '';
    this.user.address = '';
    this.user.email = '';
    this.user.phone = '';
    this.selectedRole = undefined;
  }



}
