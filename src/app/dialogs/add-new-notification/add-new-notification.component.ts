import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max, filter } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { SuccessOkDialogComponent } 
from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
// import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-new-notification',
  templateUrl: './add-new-notification.component.html',
  styleUrls: ['./add-new-notification.component.css']
})
export class AddNewNotificationComponent implements OnInit {

  operationInProgress = false;

  selectedProfileIds = [];
  profiles:any = [];
  profileId:any;
  allUsers=[];

  notification_text = '';
  notification_title = '';

  private selectedLink: string="";     
  
  setradio(e: string): void {
    this.selectedLink = e;
    if(e=="specificuser"){
      this.fetchAllUser()
    }else if(e=="sendall"){
       this.fetchAllUser()
    }
  }

  fetchAllUser(){
    if(this.allUsers.length==0){
      var profileType=this.authService.loggedInProfile.profileType as String;
      if(profileType=="adminsuper"){
      this.firestore.collection("user").snapshotChanges()
      .pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
        }))
      ).subscribe(users => {
        this.allUsers = users;
        var filteredUsers=this.allUsers.filter(user=>{
          return user.id!=this.authService.loggedInProfile.userId
        })
        this.allUsers=filteredUsers
        console.log("Fetch All users: "+this.allUsers);
      });
   }
  }
  }

  isSelected(name: string): boolean {
    if (!this.selectedLink) {
      return false;
    }
    return (this.selectedLink === name);
  }  

  isUserSelected(aUserId) {
    for (const aUser of this.allUsers) {
      if (aUser.id == aUserId) {
        return true;
      }
    }
    return false;
  }

  onSelectionChange(value){
    this.selectedProfileIds=value.value;
    console.log(this.selectedProfileIds);

  }
 

  // notification:any = {
  //   notification_text:'',
  // }

  constructor(fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AddNewNotificationComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:string
    ) { 
     
    }

  cancelClick() {
      this.dialogRef.close();
  }

  clickOnSave(){
    console.log(this.selectedProfileIds);
   
    if ((this.notification_title == undefined) || (this.notification_title.length < 1)) {
      this.openInformDialog('Invalid message','Please enter a valid notification title');
      return;
    }
    if ((this.notification_text == undefined) || (this.notification_text.length < 1)) {
      this.openInformDialog('Invalid message','Please enter a valid notification content');
      return;
    }

    if ((this.selectedLink == undefined) || (this.selectedLink.length < 1)) {
      this.openInformDialog('User not selected','Please select one or more users');
      return;
    }

    if (this.selectedLink == 'specificuser') {
      if ((this.selectedProfileIds == undefined) || (this.selectedProfileIds.length < 1)) {
        this.openInformDialog('User not selected','Please select one or more users');
        return;
      }
    }
  
    if(this.selectedLink=="specificuser"){
      this.sendNotificationToSelectedUser()
    }else if(this.selectedLink=="sendall"){
      this.sendNotificationToAll()
    }  

  }
  sendNotificationToAll(){
     this.selectedProfileIds=[]
     var promise= this.firestore.collection("commonnotices")
     .add({
      title:this.notification_title,
      notificationText:this.notification_text,
      createdById: this.authService.loggedInProfile.userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.managePromise(promise)

  }

  sendNotificationToSelectedUser(){
    if(this.selectedProfileIds.length < 1){
      return;
    }
    if (this.operationInProgress == true) { return; }
    this.operationInProgress = true;
    this.selectedProfileIds.forEach(id=>{
        this.addNoticeToUser(id)
    })
  }

  addNoticeToUser(userId:string){
    console.log("Adding notice to :"+userId)
    var promise=this.firestore.collection('user').doc(userId)
    .collection('notices').add({
      title:this.notification_title,
      notificationText:this.notification_text,
      createdById: this.authService.loggedInProfile.userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    this.managePromise(promise)
  }


  managePromise(promise:Promise<DocumentReference>){
    promise.then((aObj) => {
      this.operationInProgress = false;
      this.openInformDialog("Success", 'Notification sent successfully.');
      this.cancelClick();
    })
    .catch((error) => {
      this.operationInProgress = false;
      console.log("Error", error);
      this.openInformDialog("Error", error.message);
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

  clickOnReset(){
    this.notification_text = '';
  } 

  ngOnInit() {
  }

}
