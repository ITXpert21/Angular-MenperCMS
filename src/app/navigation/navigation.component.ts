import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

import { MessagingService } from "../services/messaging.service";

import { FormBuilder, FormGroup, Validators }from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  message=null;

  @ViewChild('sidenav') sidenav: any;
  navMode = 'side';
  profile:any;
  constructor(public dialog: MatDialog, 
    public authService: AuthService,
    private firestore: AngularFirestore,
    private router: Router,
    private afAuth: AngularFireAuth,
    private messagingService: MessagingService){
      this.profile = this.authService.loggedInProfile;
    }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
      if (event.target.innerWidth < 768) {
          this.navMode = 'over';
          this.sidenav.close();
      }
      if (event.target.innerWidth > 768) {
         this.navMode = 'side';
         this.sidenav.open();
      }
  }
  
  ngOnInit() {

    const userId = this.profile.userId;
    this.messagingService.requestPermission(userId)
    this.messagingService.receiveMessage()
    this.message = this.messagingService.currentMessage
    console.log(this.message.getValue());

  }


  doLogout() {

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: 'my-panel',
      width: '600px',
    });
    dialogRef.componentInstance.title='Confirmation';
    dialogRef.componentInstance.descr = 'Do you really want to logout?';
    dialogRef.componentInstance.deleteTitle = 'Yes, Logout';
    dialogRef.componentInstance.cancelTitle = 'No, Cancel';

    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {

        // reset fcm token for webapp
        const userId = this.profile.userId;
        this.messagingService.unlinkTokenFromUserId(userId);

        this.authService.doLogout().then(() =>{
          this.router.navigate(['login']);
        })
        .catch((error) => {
          console.log("Error", error);
          this.openDialog("Error", error.message);
        });
      }
    });

  }

  openDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle = "OK";
  }
 
  
}

