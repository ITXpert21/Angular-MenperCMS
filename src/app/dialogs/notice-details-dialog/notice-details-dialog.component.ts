import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-notice-details-dialog',
  templateUrl: './notice-details-dialog.component.html',
  styleUrls: ['./notice-details-dialog.component.css']
})
export class NoticeDetailsDialogComponent implements OnInit {

  buttonDisabled = false;
  buttonTitle:string = '';
  subjectTitle:string = '';
  p1:string = '';
  p2:string = '';
  p3:string = '';
  booking:any;


  constructor(public dialog: MatDialog, 
    public dialogRef: MatDialogRef<NoticeDetailsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data:string) { }

  ngOnInit() {
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

  buttonClick(){
    this.dialogRef.close(this.buttonTitle);
  }

}