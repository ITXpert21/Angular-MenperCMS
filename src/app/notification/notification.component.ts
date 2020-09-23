import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators }from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
// import * as Moment from 'moment';

import { NoticeDetailsDialogComponent } from '../dialogs/notice-details-dialog/notice-details-dialog.component';
import { ApproveRejectDialogComponent } 
from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  dialogResult="";
  noticeslist:any;
  unreadNoticesCount = 0;
  showSpinner: boolean = true;

  private noticeCollectionSub: Subscription;
  private orderSubscription: Subscription;


  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.updateNoticesList();
  }

  ngOnDestroy() {
    this.noticeCollectionSub.unsubscribe();
  }

  updateNoticesList(){
    const aCollection = this.firestore.collection('user')
    .doc(this.authService.loggedInProfile.userId)
    .collection<any>('notices', ref => ref.orderBy('createdAt','desc'));
    this.noticeCollectionSub = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(noticeslist => {
        this.noticeslist = noticeslist;
        this.showSpinner = false;
        let cnt = 0;
        if ((noticeslist != undefined) && (noticeslist.length > 0)) {
          for (const aNotice of noticeslist) {
            if (aNotice.isRead == false) {
              cnt++;
            }
          }
        }
        this.unreadNoticesCount = cnt;
        // console.log(this.noticeslist);
    });
  }

  openNoticeDetailsDialog(aNotice): void {
    const dialogRef = this.dialog.open(NoticeDetailsDialogComponent, {
      panelClass: 'my-panel',
      width: '600px',
    });

    if (aNotice.type == 'orderNewEntry'){
      if ((aNotice.alreadyActed == undefined) || (aNotice.alreadyActed == false)) {
        dialogRef.componentInstance.buttonDisabled = false;
      } else {
        dialogRef.componentInstance.buttonDisabled = true;
      }

      dialogRef.componentInstance.buttonDisabled = true;
      dialogRef.componentInstance.subjectTitle = aNotice.header;
      dialogRef.componentInstance.p1 = aNotice.title + ' approved.';
    }

    if (aNotice.type == 'registrationNewUser'){
      if ((aNotice.alreadyActed == undefined) || (aNotice.alreadyActed == false)) {
        dialogRef.componentInstance.buttonDisabled = false;
      } else {
        dialogRef.componentInstance.buttonDisabled = true;
      }

      dialogRef.componentInstance.buttonDisabled = true;
      dialogRef.componentInstance.subjectTitle = aNotice.header;
      dialogRef.componentInstance.p1 = aNotice.title ;
    }

    if (aNotice.isRead == false) {
      this.firestore.collection('user')
      .doc(this.authService.loggedInProfile.userId)
      .collection<any>('notices').doc(aNotice.id).update({isRead: true})
      .then()
      .catch((err) => {console.error(err)});
    }
  } 

  deleteButtonClicked(aNotice){
    const dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = 'Are you sure?';
    dialogRef.componentInstance.descr = 
    "Do you really want to remove this entry";

    dialogRef.componentInstance.approveTitle = 'Yes, Remove';
    dialogRef.componentInstance.rejectTitle = 'No, Cancel';

    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.approveTitle) {
        this.firestore.collection('user').doc(this.authService.loggedInProfile.userId)
        .collection('notices').doc(aNotice.id).delete()
          .then(() => {
            // user created. now create profile in firestore.
            this.openInformDialog("SUCCESS","Entry removed successfully.");
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